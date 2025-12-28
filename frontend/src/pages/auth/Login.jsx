// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext'; // <--- Import Context
// import Input from '../../components/Input';
// import Button from '../../components/Button';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth(); // <--- Get the login function from Context
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     tenantSubdomain: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       // Use the Context login function instead of direct Axios
//       // This ensures the App State updates IMMEDIATELY
//       await login(formData.email, formData.password, formData.tenantSubdomain);
      
//       // Redirect to dashboard
//       navigate('/dashboard');
//     } catch (err) {
//       console.error("Login Error:", err);
//       // Handle the nested error object from axios
//       const msg = err.response?.data?.message || 'Invalid credentials or server error';
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h2>
        
//         {error && (
//           <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Input 
//             label="Email Address" 
//             type="email" 
//             required 
//             value={formData.email}
//             onChange={(e) => setFormData({...formData, email: e.target.value})}
//             placeholder="name@company.com"
//           />
          
//           <Input 
//             label="Password" 
//             type="password" 
//             required 
//             value={formData.password}
//             onChange={(e) => setFormData({...formData, password: e.target.value})}
//             placeholder="••••••••"
//           />

//           <Input 
//             label="Organization Subdomain (Optional)" 
//             type="text" 
//             value={formData.tenantSubdomain}
//             onChange={(e) => setFormData({...formData, tenantSubdomain: e.target.value})}
//             placeholder="e.g. acme (leave empty if unsure)"
//           />

//           <Button type="submit" disabled={loading}>
//             {loading ? 'Signing in...' : 'Sign In'}
//           </Button>
//         </form>
        
//         <p className="mt-4 text-center text-sm text-gray-600">
//           Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <--- Import Context
import Input from '../../components/Input';
import Button from '../../components/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // <--- Get the login function from Context
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the Context login function instead of direct Axios
      // This ensures the App State updates IMMEDIATELY
      await login(formData.email, formData.password, formData.tenantSubdomain);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      // Handle the nested error object from axios
      const msg = err.response?.data?.message || 'Invalid credentials or server error';
      setError(msg);
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