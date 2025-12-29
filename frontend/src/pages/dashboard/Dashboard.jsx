// import { useEffect, useState } from 'react';
// import { useAuth } from '../../context/AuthContext'; // To get user info
// import api from '../../api/axios'; // Your axios instance
// import { Briefcase, CheckSquare, Users, TrendingUp } from 'lucide-react';

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     totalProjects: 0,
//     activeTasks: 0,
//     completedTasks: 0,
//     totalUsers: 0
//   });
//   const [tenantInfo, setTenantInfo] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         // 1. Get Tenant Details (Plan & Limits)
//         // We use the tenant ID from the logged-in user
//         if (user?.tenantId) {
//           const tenantRes = await api.get(`/tenants/${user.tenantId}`);
//           setTenantInfo(tenantRes.data.data);
//         }

//         // 2. Get Projects Count
//         const projRes = await api.get('/projects');
//         const projects = projRes.data.data || [];

//         // 3. Get Tasks Count
//         const taskRes = await api.get('/tasks');
//         const tasks = taskRes.data.data || [];

//         // 4. Get Users Count
//         // (Only works if you are admin, but we wrap in try/catch just in case)
//         let userCount = 0;
//         try {
//             if (user?.tenantId) {
//                 const userRes = await api.get(`/tenants/${user.tenantId}/users`);
//                 userCount = userRes.data.data?.length || 0;
//             }
//         } catch (e) { console.warn("Could not fetch users count"); }

//         setStats({
//           totalProjects: projects.length,
//           activeTasks: tasks.filter(t => t.status !== 'completed').length,
//           completedTasks: tasks.filter(t => t.status === 'completed').length,
//           totalUsers: userCount
//         });

//       } catch (error) {
//         console.error("Dashboard load failed", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [user]);

//   if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

//   // Calculate percentages for progress bars
//   const projectUsage = tenantInfo ? (stats.totalProjects / tenantInfo.maxProjects) * 100 : 0;
//   const userUsage = tenantInfo ? (stats.totalUsers / tenantInfo.maxUsers) * 100 : 0;

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

//       {/* --- PLAN & LIMITS SECTION (NEW) --- */}
//       {tenantInfo && (
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
//           <div className="flex justify-between items-center mb-4">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800">Subscription Status</h3>
//               <p className="text-gray-500 text-sm">
//                 Current Plan: <span className="font-bold text-blue-600 uppercase">{tenantInfo.subscriptionPlan}</span>
//               </p>
//             </div>
//             {/* Status Badge */}
//             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
//                 tenantInfo.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//             }`}>
//               {tenantInfo.status}
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* Project Limit Bar */}
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span className="font-medium text-gray-700">Projects Used</span>
//                 <span className={`font-bold ${stats.totalProjects >= tenantInfo.maxProjects ? 'text-red-600' : 'text-gray-600'}`}>
//                   {stats.totalProjects} / {tenantInfo.maxProjects}
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2.5">
//                 <div 
//                   className={`h-2.5 rounded-full ${stats.totalProjects >= tenantInfo.maxProjects ? 'bg-red-500' : 'bg-blue-600'}`} 
//                   style={{ width: `${Math.min(projectUsage, 100)}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* User Limit Bar */}
//             <div>
//               <div className="flex justify-between text-sm mb-1">
//                 <span className="font-medium text-gray-700">Team Members</span>
//                 <span className="font-bold text-gray-600">
//                   {stats.totalUsers} / {tenantInfo.maxUsers}
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2.5">
//                 <div 
//                   className="bg-green-500 h-2.5 rounded-full" 
//                   style={{ width: `${Math.min(userUsage, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- STATS CARDS --- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
//           <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600">
//             <Briefcase className="w-6 h-6" />
//           </div>
//           <div>
//             <p className="text-gray-500 text-sm font-medium">Total Projects</p>
//             <p className="text-3xl font-bold text-gray-800">{stats.totalProjects}</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
//           <div className="p-3 bg-yellow-100 rounded-full mr-4 text-yellow-600">
//             <TrendingUp className="w-6 h-6" />
//           </div>
//           <div>
//             <p className="text-gray-500 text-sm font-medium">Active Tasks</p>
//             <p className="text-3xl font-bold text-gray-800">{stats.activeTasks}</p>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
//           <div className="p-3 bg-green-100 rounded-full mr-4 text-green-600">
//             <CheckSquare className="w-6 h-6" />
//           </div>
//           <div>
//             <p className="text-gray-500 text-sm font-medium">Completed Tasks</p>
//             <p className="text-3xl font-bold text-gray-800">{stats.completedTasks}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;




import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Briefcase, CheckSquare, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalUsers: 0
  });
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get Tenant Info
        if (user?.tenantId) {
          const tenantRes = await api.get(`/tenants/${user.tenantId}`);
          setTenantInfo(tenantRes.data.data);
        }

        // 2. Get Stats
        const [projRes, taskRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);

        const projects = projRes.data.data || [];
        const tasks = taskRes.data.data || [];

        // 3. Get User Count (Safe Fetch)
        let userCount = 0;
        try {
          const userRes = await api.get(`/tenants/${user.tenantId}/users`);
          userCount = userRes.data.data?.length || 0;
        } catch (e) { console.warn("Could not fetch users"); }

        setStats({
          totalProjects: projects.length,
          activeTasks: tasks.filter(t => t.status !== 'completed').length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          totalUsers: userCount
        });

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  // --- THE FIX IS HERE ---
  // We prioritize 'max_projects' (from DB) so the number actually shows up
  const maxProjects = tenantInfo?.max_projects || tenantInfo?.maxProjects || 1; 
  const maxUsers = tenantInfo?.max_users || tenantInfo?.maxUsers || 1;
  const planName = tenantInfo?.subscription_plan || tenantInfo?.subscriptionPlan || 'Unknown';
  
  // Calculate percentages (cap at 100%)
  const projectUsage = Math.min((stats.totalProjects / maxProjects) * 100, 100);
  const userUsage = Math.min((stats.totalUsers / maxUsers) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* --- PLAN STATUS CARD --- */}
      {tenantInfo ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
              <div className="flex items-center mt-1">
                <span className="text-gray-500 text-sm mr-2">Current Plan:</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                  {planName}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                tenantInfo.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {tenantInfo.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project Limit */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Projects Used</span>
                <span className="font-bold text-gray-900">
                  {stats.totalProjects} <span className="text-gray-400">/</span> {maxProjects}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${projectUsage >= 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
                  style={{ width: `${projectUsage}%` }}
                ></div>
              </div>
            </div>

            {/* User Limit */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Team Members</span>
                <span className="font-bold text-gray-900">
                  {stats.totalUsers} <span className="text-gray-400">/</span> {maxUsers}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-500" 
                  style={{ width: `${userUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 flex items-center mb-8">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Could not load subscription details. Please contact support.</span>
        </div>
      )}

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Briefcase className="w-6 h-6 text-blue-600" />} 
          label="Total Projects" 
          value={stats.totalProjects} 
          color="bg-blue-50 border-blue-100"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-yellow-600" />} 
          label="Active Tasks" 
          value={stats.activeTasks} 
          color="bg-yellow-50 border-yellow-100"
        />
        <StatCard 
          icon={<CheckSquare className="w-6 h-6 text-green-600" />} 
          label="Completed Tasks" 
          value={stats.completedTasks} 
          color="bg-green-50 border-green-100"
        />
      </div>
    </div>
  );
};

// Helper Component for consistency
const StatCard = ({ icon, label, value, color }) => (
  <div className={`p-6 rounded-xl border ${color} flex items-center transition-transform hover:scale-105`}>
    <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;