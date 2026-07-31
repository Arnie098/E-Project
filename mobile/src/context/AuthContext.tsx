import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  apiFetch,
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from '../api/client';
import type { User } from '../api/types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type AuthContextValue = {
  status: Status;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUserState] = useState<User | null>(null);

  const bootstrap = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    try {
      const res = await apiFetch<{ user: User }>('/user');
      setUserState(res.user);
      setStatus('authenticated');
    } catch {
      await clearToken();
      setUserState(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Send the learner back to login if any authenticated request returns 401
  // (token expired or revoked mid-session).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUserState(null);
      setStatus('unauthenticated');
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>('/login', {
      method: 'POST',
      auth: false,
      body: { email, password, device_name: 'mobile' },
    });
    await setToken(res.token);
    setUserState(res.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await apiFetch<{ token: string; user: User }>('/register', {
      method: 'POST',
      auth: false,
      body: { ...input, device_name: 'mobile' },
    });
    await setToken(res.token);
    setUserState(res.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    await clearToken();
    setUserState(null);
    setStatus('unauthenticated');
  }, []);

  const refresh = useCallback(async () => {
    const res = await apiFetch<{ user: User }>('/user');
    setUserState(res.user);
  }, []);

  const setUser = useCallback((next: User) => setUserState(next), []);

  return (
    <AuthContext.Provider
      value={{ status, user, login, register, logout, refresh, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
