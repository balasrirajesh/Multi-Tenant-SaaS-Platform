// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';
// import api from '../../api/axios';
// import Button from '../../components/Button'; // Ensure this path is correct
// import Modal from '../../components/Modal';   // Ensure this path is correct
// import Input from '../../components/Input';   // Ensure this path is correct

// const ProjectDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [project, setProject] = useState(null);
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Since we don't have a "Get One Project" API yet, we filter the list
//         const projRes = await api.get('/projects');
//         const foundProject = projRes.data.data.find(p => p.id === parseInt(id) || p.id === id);
//         setProject(foundProject);

//         // Fetch tasks
//         const taskRes = await api.get('/tasks');
//         setTasks(taskRes.data.data.filter(t => t.project_id === parseInt(id) || t.project_id === id));
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [id]);

//   const handleCreateTask = async (e) => {
//     e.preventDefault();
//     try {
//       // Send projectId as part of the body
//       await api.post('/tasks', { ...newTask, projectId: id });
//       // Refresh tasks
//       const taskRes = await api.get('/tasks');
//       setTasks(taskRes.data.data.filter(t => t.project_id === parseInt(id) || t.project_id === id));
//       setIsModalOpen(false);
//       setNewTask({ title: '', description: '', priority: 'medium' });
//     } catch (err) {
//       alert("Failed to create task");
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;
//   if (!project) return <div className="p-6">Project not found</div>;

//   return (
//     <div>
//       <button onClick={() => navigate('/projects')} className="flex items-center text-gray-500 mb-4">
//         <ArrowLeft className="w-4 h-4 mr-1" /> Back
//       </button>
//       <div className="flex justify-between items-start mb-6">
//         <h1 className="text-3xl font-bold">{project.name}</h1>
//         <Button onClick={() => setIsModalOpen(true)}>Add Task</Button>
//       </div>
      
//       <div className="bg-white shadow rounded-lg border border-gray-200">
//          <div className="p-4 border-b font-medium">Tasks</div>
//          <div className="divide-y">
//             {tasks.map(task => (
//               <div key={task.id} className="p-4 flex items-center">
//                 {task.status === 'completed' ? <CheckCircle className="text-green-500 mr-3"/> : <Circle className="text-gray-400 mr-3"/>}
//                 <div>
//                   <div className="font-medium">{task.title}</div>
//                   <div className="text-sm text-gray-500">{task.description}</div>
//                 </div>
//               </div>
//             ))}
//             {tasks.length === 0 && <div className="p-4 text-gray-500 text-center">No tasks yet.</div>}
//          </div>
//       </div>

//       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Task">
//         <form onSubmit={handleCreateTask} className="space-y-4">
//           <Input label="Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
//           <Input label="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
//           <Button type="submit">Save Task</Button>
//         </form>
//       </Modal>
//     </div>
//   );
// };

// export default ProjectDetails;




import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Trash2, Edit } from 'lucide-react'; 
import api from '../../api/axios';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      // Fetch Project Info
      // (Optimally we should have a GET /projects/:id endpoint, but filtering works for now)
      const projRes = await api.get('/projects');
      const foundProject = projRes.data.data.find(p => p.id === parseInt(id) || p.id === id);
      setProject(foundProject);

      // Fetch Tasks
      const taskRes = await api.get(`/tasks?projectId=${id}`); 
      // If backend filtering is set up, this is cleaner. 
      // If not, we filter client side:
      const allTasks = taskRes.data.data;
      const myTasks = allTasks.filter(t => t.project_id === (foundProject?.id || id) || t.project_id === parseInt(id));
      
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 2. Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
      fetchData(); // Refresh list
    } catch (err) {
      alert("Failed to create task");
    }
  };

  // 3. Toggle Status (Complete/Todo)
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
      // Optimistic update (feels faster)
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert("Failed to update status");
      fetchData(); // Revert on error
    }
  };

  // 4. Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  if (loading) return <div className="p-6">Loading Project...</div>;
  if (!project) return <div className="p-6">Project not found.</div>;

  return (
    <div>
      <button onClick={() => navigate('/projects')} className="flex items-center text-gray-500 mb-4 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wide ${
              project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {project.status}
            </span>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Task</Button>
      </div>
      
      {/* Task List */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
         <div className="p-4 border-b font-medium bg-gray-50 flex justify-between items-center">
            <span>Project Tasks ({tasks.length})</span>
         </div>
         <div className="divide-y">
            {tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">No tasks yet. Create one to get started!</div>
            ) : (
                tasks.map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center cursor-pointer" onClick={() => handleToggleStatus(task)}>
                    {task.status === 'completed' ? (
                        <CheckCircle className="text-green-500 mr-3 w-6 h-6 flex-shrink-0" />
                    ) : (
                        <Circle className="text-gray-400 mr-3 w-6 h-6 flex-shrink-0 group-hover:text-blue-500" />
                    )}
                    
                    <div className={`${task.status === 'completed' ? 'opacity-50 line-through' : ''}`}>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                        
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                            {task.priority}
                            </span>
                        </div>
                    </div>
                    </div>

                    <div className="flex items-center">
                        <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                ))
            )}
         </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input 
            label="Task Title" 
            value={newTask.title} 
            required 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
            placeholder="e.g. Design Homepage"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTask.priority}
              onChange={e => setNewTask({...newTask, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button type="submit">Create Task</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;