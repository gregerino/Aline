import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import api from '../services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.access_token);
    await fetchUser();
  }, [fetchUser]);

  const register = useCallback(async (email: string, password: string, company?: string) => {
    const { data } = await api.post('/auth/register', { email, password, company });
    localStorage.setItem('token', data.access_token);
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
}
