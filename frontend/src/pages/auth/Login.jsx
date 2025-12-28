// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext'; // Using our Context
// import Button from '../../components/Button';
// import Input from '../../components/Input';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // Get login function from context
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     subdomain: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Call login function from AuthContext
//       await login(formData.email, formData.password, formData.subdomain);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid credentials or tenant');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Sign in to your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Or <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">register a new organization</Link>
//           </p>
//         </div>

//         {error && (
//           <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">
//             {error}
//           </div>
//         )}

//         <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
//           <Input 
//             label="Organization Subdomain" 
//             name="subdomain" 
//             value={formData.subdomain} 
//             onChange={handleChange} 
//             required 
//             placeholder="e.g. demo"
//           />

//           <Input 
//             label="Email Address" 
//             type="email"
//             name="email" 
//             value={formData.email} 
//             onChange={handleChange} 
//             required 
//           />

//           <Input 
//             label="Password" 
//             type="password"
//             name="password" 
//             value={formData.password} 
//             onChange={handleChange} 
//             required 
//           />

//           <Button type="submit" disabled={loading}>
//             {loading ? 'Signing in...' : 'Sign In'}
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: '' // Optional
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (res.data.success) {
        // --- CRITICAL FIX START ---
        // We must save the Token AND the User Data (which contains tenantId)
        const { token, user } = res.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); 
        // --- CRITICAL FIX END ---

        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="name@company.com"
          />
          
          <Input 
            label="Password" 
            type="password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="••••••••"
          />

          <Input 
            label="Organization Subdomain (Optional)" 
            type="text" 
            value={formData.tenantSubdomain}
            onChange={(e) => setFormData({...formData, tenantSubdomain: e.target.value})}
            placeholder="e.g. acme (leave empty if unsure)"
          />

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;