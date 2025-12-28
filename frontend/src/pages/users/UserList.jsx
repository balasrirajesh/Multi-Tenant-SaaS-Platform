import { useState, useEffect } from 'react';
import { Plus, User, Trash2, Shield, ShieldAlert } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [newUser, setNewUser] = useState({ 
    email: '', 
    fullName: '', 
    password: '', 
    role: 'user' 
  });

  // 1. Fetch Users (Mock Data)
  useEffect(() => {
    // In real app: await api.get(`/tenants/${tenantId}/users`);
    setUsers([
      { id: 1, fullName: 'Alice Admin', email: 'admin@demo.com', role: 'tenant_admin', status: 'active', joined: '2024-01-15' },
      { id: 2, fullName: 'Bob Builder', email: 'bob@demo.com', role: 'user', status: 'active', joined: '2024-02-20' },
      { id: 3, fullName: 'Charlie Checker', email: 'charlie@demo.com', role: 'user', status: 'inactive', joined: '2024-03-10' },
    ]);
  }, []);

  // 2. Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In real app: await api.post(`/tenants/${tenantId}/users`, newUser);
      
      // Mock update:
      const mockUser = { id: Date.now(), ...newUser, status: 'active', joined: new Date().toISOString().split('T')[0] };
      setUsers([...users, mockUser]);
      setIsModalOpen(false);
      setNewUser({ email: '', fullName: '', password: '', role: 'user' }); // Reset
    } catch (error) {
      console.error("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Delete (Mock)
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'tenant_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'tenant_admin' ? <ShieldAlert className="w-3 h-3 mr-1"/> : <Shield className="w-3 h-3 mr-1"/>}
                    {user.role === 'tenant_admin' ? 'Admin' : 'Member'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.joined}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Invite New Team Member"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input 
            label="Full Name" 
            value={newUser.fullName}
            onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
            required
            placeholder="John Doe"
          />
          
          <Input 
            label="Email Address" 
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            required
            placeholder="john@company.com"
          />

          <Input 
            label="Temporary Password" 
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            required
            placeholder="******"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="user">Regular User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;