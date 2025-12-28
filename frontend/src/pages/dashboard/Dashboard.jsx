import { useEffect, useState } from 'react';
import api from '../../api/axios';

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    activeTasks: 0,
    completedTasks: 0
  });

  // Mock data for now (Since backend isn't connected yet)
  useEffect(() => {
    // In real app: Fetch from API 3 (Me) or API 13 (Projects)
    setStats({
      projects: 5,
      activeTasks: 12,
      completedTasks: 8
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Projects" value={stats.projects} color="text-blue-600" />
        <StatCard title="Active Tasks" value={stats.activeTasks} color="text-yellow-600" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} color="text-green-600" />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Projects</h3>
        <div className="text-gray-500 text-center py-8">
          No recent activity found.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;