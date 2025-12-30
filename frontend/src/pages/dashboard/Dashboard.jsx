// import { useEffect, useState } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../api/axios';
// import { Briefcase, CheckSquare, TrendingUp, AlertCircle } from 'lucide-react';

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
//         // 1. Get Tenant Info
//         if (user?.tenantId) {
//           const tenantRes = await api.get(`/tenants/${user.tenantId}`);
//           setTenantInfo(tenantRes.data.data);
//         }

//         // 2. Get Stats
//         const [projRes, taskRes] = await Promise.all([
//           api.get('/projects'),
//           api.get('/tasks')
//         ]);

//         const projects = projRes.data.data || [];
//         const tasks = taskRes.data.data || [];

//         // 3. Get User Count (Safe Fetch)
//         let userCount = 0;
//         try {
//           const userRes = await api.get(`/tenants/${user.tenantId}/users`);
//           userCount = userRes.data.data?.length || 0;
//         } catch (e) { console.warn("Could not fetch users"); }

//         setStats({
//           totalProjects: projects.length,
//           activeTasks: tasks.filter(t => t.status !== 'completed').length,
//           completedTasks: tasks.filter(t => t.status === 'completed').length,
//           totalUsers: userCount
//         });

//       } catch (error) {
//         console.error("Dashboard error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [user]);

//   if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

//   // --- THE FIX IS HERE ---
//   // We prioritize 'max_projects' (from DB) so the number actually shows up
//   const maxProjects = tenantInfo?.max_projects || tenantInfo?.maxProjects || 1; 
//   const maxUsers = tenantInfo?.max_users || tenantInfo?.maxUsers || 1;
//   const planName = tenantInfo?.subscription_plan || tenantInfo?.subscriptionPlan || 'Unknown';
  
//   // Calculate percentages (cap at 100%)
//   const projectUsage = Math.min((stats.totalProjects / maxProjects) * 100, 100);
//   const userUsage = Math.min((stats.totalUsers / maxUsers) * 100, 100);

//   return (
//     <div className="max-w-6xl mx-auto">
//       <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

//       {/* --- PLAN STATUS CARD --- */}
//       {tenantInfo ? (
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
//           <div className="flex justify-between items-start mb-6">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
//               <div className="flex items-center mt-1">
//                 <span className="text-gray-500 text-sm mr-2">Current Plan:</span>
//                 <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
//                   {planName}
//                 </span>
//               </div>
//             </div>
//             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
//                 tenantInfo.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//             }`}>
//               {tenantInfo.status}
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             {/* Project Limit */}
//             <div>
//               <div className="flex justify-between text-sm mb-2">
//                 <span className="font-medium text-gray-700">Projects Used</span>
//                 <span className="font-bold text-gray-900">
//                   {stats.totalProjects} <span className="text-gray-400">/</span> {maxProjects}
//                 </span>
//               </div>
//               <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
//                 <div 
//                   className={`h-full transition-all duration-500 ${projectUsage >= 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
//                   style={{ width: `${projectUsage}%` }}
//                 ></div>
//               </div>
//             </div>

//             {/* User Limit */}
//             <div>
//               <div className="flex justify-between text-sm mb-2">
//                 <span className="font-medium text-gray-700">Team Members</span>
//                 <span className="font-bold text-gray-900">
//                   {stats.totalUsers} <span className="text-gray-400">/</span> {maxUsers}
//                 </span>
//               </div>
//               <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
//                 <div 
//                   className="bg-green-500 h-full transition-all duration-500" 
//                   style={{ width: `${userUsage}%` }}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 flex items-center mb-8">
//           <AlertCircle className="w-5 h-5 mr-2" />
//           <span>Could not load subscription details. Please contact support.</span>
//         </div>
//       )}

//       {/* --- STATS GRID --- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <StatCard 
//           icon={<Briefcase className="w-6 h-6 text-blue-600" />} 
//           label="Total Projects" 
//           value={stats.totalProjects} 
//           color="bg-blue-50 border-blue-100"
//         />
//         <StatCard 
//           icon={<TrendingUp className="w-6 h-6 text-yellow-600" />} 
//           label="Active Tasks" 
//           value={stats.activeTasks} 
//           color="bg-yellow-50 border-yellow-100"
//         />
//         <StatCard 
//           icon={<CheckSquare className="w-6 h-6 text-green-600" />} 
//           label="Completed Tasks" 
//           value={stats.completedTasks} 
//           color="bg-green-50 border-green-100"
//         />
//       </div>
//     </div>
//   );
// };

// // Helper Component for consistency
// const StatCard = ({ icon, label, value, color }) => (
//   <div className={`p-6 rounded-xl border ${color} flex items-center transition-transform hover:scale-105`}>
//     <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
//       {icon}
//     </div>
//     <div>
//       <p className="text-gray-500 text-sm font-medium">{label}</p>
//       <p className="text-3xl font-bold text-gray-900">{value}</p>
//     </div>
//   </div>
// );

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

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Get Tenant Info (SKIP for Super Admin)
        if (user?.tenantId && !isSuperAdmin) {
          try {
            const tenantRes = await api.get(`/tenants/${user.tenantId}`);
            setTenantInfo(tenantRes.data.data);
          } catch (err) {
            console.warn("Tenant info fetch failed", err);
          }
        }

        // 2. Get Stats
        // Note: For Super Admin, these endpoints usually return ALL data or System data
        const [projRes, taskRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);

        const projects = projRes.data.data || [];
        const tasks = taskRes.data.data || [];

        // 3. Get User Count (Safe Fetch)
        let userCount = 0;
        if (user?.tenantId) {
            try {
            const userRes = await api.get(`/tenants/${user.tenantId}/users`);
            userCount = userRes.data.data?.length || 0;
            } catch (e) { console.warn("Could not fetch users"); }
        }

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
  }, [user, isSuperAdmin]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  // Safe variables for tenants
  const maxProjects = tenantInfo?.max_projects || tenantInfo?.maxProjects || 1; 
  const maxUsers = tenantInfo?.max_users || tenantInfo?.maxUsers || 1;
  const planName = tenantInfo?.subscription_plan || tenantInfo?.subscriptionPlan || 'Unknown';
  
  const projectUsage = Math.min((stats.totalProjects / maxProjects) * 100, 100);
  const userUsage = Math.min((stats.totalUsers / maxUsers) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* --- SECTION 1: SUBSCRIPTION STATUS (HIDDEN FOR SUPER ADMIN) --- */}
      {!isSuperAdmin && (
        <>
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
            // This error ONLY shows for tenants with missing data, never Super Admin
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 flex items-center mb-8">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Could not load subscription details. Please contact support.</span>
            </div>
          )}
        </>
      )}

      {/* --- SECTION 2: STATS GRID (VISIBLE TO EVERYONE) --- */}
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

// Helper Component
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