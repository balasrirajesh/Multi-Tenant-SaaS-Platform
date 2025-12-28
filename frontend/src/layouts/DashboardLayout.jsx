import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban, Users, Building } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg z-10 hidden md:block">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-blue-600">SaaS Platform</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          
          <Link to="/projects" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
            <FolderKanban className="w-5 h-5 mr-3" />
            Projects
          </Link>

          {/* Role-Based Links */}
          {(user?.role === 'tenant_admin' || user?.role === 'super_admin') && (
            <Link to="/users" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
              <Users className="w-5 h-5 mr-3" />
              Users
            </Link>
          )}

          {user?.role === 'super_admin' && (
            <Link to="/tenants" className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
              <Building className="w-5 h-5 mr-3" />
              Tenants
            </Link>
          )}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button onClick={logout} className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6">
          <div className="md:hidden">Menu</div> {/* Mobile menu trigger placeholder */}
          <div className="ml-auto flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">
              {user?.fullName || 'User'}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
              {user?.role?.replace('_', ' ') || 'Guest'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet /> {/* This renders the current page (Dashboard, Projects, etc.) */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;