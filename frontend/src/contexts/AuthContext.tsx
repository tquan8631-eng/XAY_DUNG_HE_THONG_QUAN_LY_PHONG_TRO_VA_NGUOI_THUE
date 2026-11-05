import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthUser, LoginPayload } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (data: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
  isAuthenticated: boolean;
  isQuanLy: boolean;
  isNguoiThue: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readUser = (): AuthUser | null => {
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const homePathFor = (user?: AuthUser | null) => (user?.vai_tro === 'nguoi_thue' ? '/cua-toi' : '/');

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(readUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    authApi.logout().catch(() => undefined);
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.getMe();
        if (!cancelled) {
          setUser(me);
          localStorage.setItem('user', JSON.stringify(me));
        }
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    if (!res?.success || !res.data?.token) throw new Error(res?.message || 'Đăng nhập thất bại');
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    setToken(res.data.token);
    return res.data.user;
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isQuanLy: user?.vai_tro === 'chu_nha' || user?.vai_tro === 'nhan_vien',
    isNguoiThue: user?.vai_tro === 'nguoi_thue',
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
