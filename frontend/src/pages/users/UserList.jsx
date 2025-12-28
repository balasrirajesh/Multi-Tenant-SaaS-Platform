import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, User, Trash2, Shield, ShieldAlert } from 'lucide-react';
// Components
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

  // --- IMPROVED: Get Tenant ID Safely ---
  const getTenantId = () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    
    try {
      const parsed = JSON.parse(userString);
      // Sometimes the user data is nested inside "user" object, sometimes it's flat
      const userData = parsed.user || parsed; 
      
      // CHECK BOTH VARIATIONS (camelCase and snake_case)
      return userData.tenantId || userData.tenant_id;
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  const tenantId = getTenantId();
  const token = localStorage.getItem('token');

  // 1. Fetch Users
  const fetchUsers = async () => {
    if (!tenantId) return; // Don't fetch if we don't have an ID

    try {
      const res = await axios.get(`http://localhost:5000/api/tenants/${tenantId}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchUsers();
    } else {
      console.warn("Still no Tenant ID found in localStorage.");
    }
  }, [tenantId]);

  // 2. Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!tenantId) {
      alert("System Error: Your session is missing the Tenant ID. Please logout and login again.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/tenants/${tenantId}/users`, 
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        alert('User added successfully!');
        setIsModalOpen(false);
        setNewUser({ email: '', fullName: '', password: '', role: 'user' });
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to add user";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    alert("Delete feature coming soon!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
        
        {/* Only show button if we have a valid tenant ID */}
        {tenantId && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        )}
      </div>

      {/* Warning Banner if ID is missing */}
      {!tenantId ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded border border-yellow-200">
          <strong>⚠️ Session Issue:</strong> We cannot identify your organization ID. 
          <br />
          Please <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="underline font-bold">Logout</button> and Log in again to fix this.
        </div>
      ) : (
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
              {users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
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
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={handleDelete} className="text-red-600 hover:text-red-900 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite New Team Member">
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input 
            label="Full Name" value={newUser.fullName} required placeholder="John Doe"
            onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
          />
          <Input 
            label="Email Address" type="email" value={newUser.email} required placeholder="john@company.com"
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          />
          <Input 
            label="Temporary Password" type="password" value={newUser.password} required placeholder="******"
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
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
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserList;