import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in when the app starts
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Call API to get current user details
          const { data } = await api.get('/auth/me'); 
          setUser(data.data);
        } catch (error) {
          console.error("Auth verification failed", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  // Login Function
  const login = async (email, password, subdomain) => {
    const { data } = await api.post('/auth/login', { 
      email, 
      password, 
      tenantSubdomain: subdomain // Match the backend expectation
    });
    
    // Save token and user state
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
    return data;
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth easily
export const useAuth = () => useContext(AuthContext);