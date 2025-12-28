import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/Button'; // Ensure this path is correct
import Modal from '../../components/Modal';   // Ensure this path is correct
import Input from '../../components/Input';   // Ensure this path is correct

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Since we don't have a "Get One Project" API yet, we filter the list
        const projRes = await api.get('/projects');
        const foundProject = projRes.data.data.find(p => p.id === parseInt(id) || p.id === id);
        setProject(foundProject);

        // Fetch tasks
        const taskRes = await api.get('/tasks');
        setTasks(taskRes.data.data.filter(t => t.project_id === parseInt(id) || t.project_id === id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Send projectId as part of the body
      await api.post('/tasks', { ...newTask, projectId: id });
      // Refresh tasks
      const taskRes = await api.get('/tasks');
      setTasks(taskRes.data.data.filter(t => t.project_id === parseInt(id) || t.project_id === id));
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      alert("Failed to create task");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div>
      <button onClick={() => navigate('/projects')} className="flex items-center text-gray-500 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add Task</Button>
      </div>
      
      <div className="bg-white shadow rounded-lg border border-gray-200">
         <div className="p-4 border-b font-medium">Tasks</div>
         <div className="divide-y">
            {tasks.map(task => (
              <div key={task.id} className="p-4 flex items-center">
                {task.status === 'completed' ? <CheckCircle className="text-green-500 mr-3"/> : <Circle className="text-gray-400 mr-3"/>}
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <div className="p-4 text-gray-500 text-center">No tasks yet.</div>}
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
          <Input label="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
          <Button type="submit">Save Task</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;