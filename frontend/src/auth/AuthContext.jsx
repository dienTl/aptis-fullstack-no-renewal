import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me')
      .then((r) => setUser(r.data.data))
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', r.data.data.accessToken);
    localStorage.setItem('refreshToken', r.data.data.refreshToken);
    setUser(r.data.data.user);
  }

  async function register(data) {
    const r = await api.post('/auth/register', data);
    localStorage.setItem('accessToken', r.data.data.accessToken);
    localStorage.setItem('refreshToken', r.data.data.refreshToken);
    setUser(r.data.data.user);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
