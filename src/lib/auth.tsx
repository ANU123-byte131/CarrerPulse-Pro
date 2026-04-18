import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Profile {
  userId: string;
  education: string;
  skills: string[];
  experience: string[];
  targetRole: string;
  bio: string;
  experienceLevel: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cp_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('cp_token', data.token);
    setToken(data.token);
    setUser(data.user);
    // Fetch profile
    const meRes = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      setProfile(meData.profile);
    }
  }

  async function register(email: string, password: string, name: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('cp_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setProfile(null);
  }

  function logout() {
    localStorage.removeItem('cp_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(data: Partial<Profile>) {
    const t = localStorage.getItem('cp_token');
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const result = await res.json();
    setProfile(result.profile);
  }

  async function refreshProfile() {
    await fetchMe();
  }

  return (
    <AuthContext.Provider value={{ user, profile, token, isLoading, login, register, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('cp_token');
  return fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
