import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const token = localStorage.getItem('tw_token');
    const saved = localStorage.getItem('tw_user');

    if (!token) { setLoading(false); return; }

    
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }

   
    getMe()
      .then(res => {
        setUser(res.data.user);
        localStorage.setItem('tw_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        if (!saved) {
          localStorage.removeItem('tw_token');
          localStorage.removeItem('tw_user');
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('tw_token', token);
    localStorage.setItem('tw_user', JSON.stringify(user));
    setUser(user);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem('tw_token', token);
    localStorage.setItem('tw_user', JSON.stringify(user));
    setUser(user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tw_token');
    localStorage.removeItem('tw_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);