import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { User } from '../types';
import TwoFactorVerification from '../components/Auth/TwoFactorVerification';

interface AuthContextType {
  user: User | null;
  session: any | null; // Changed to any or custom interface
  loading: boolean;
  isAdmin: boolean;
  showTwoFactorVerification: boolean;
  twoFactorData: { secret: string; backupCodes: string[]; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    fullName: string,
    referralCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completeTwoFactorVerification: () => void;
  cancelTwoFactorVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTwoFactorVerification, setShowTwoFactorVerification] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string; backupCodes: string[]; email: string } | null>(null);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await api.get('/auth/me');
        // Map backend user to frontend User interface if needed
        const profile: User = {
          ...data,
          // Ensure required fields exist or map them
          balance: data.balance || 0,
          wallet_balance: data.balance || 0, // Deprecated
          is_admin: data.role === 'admin'
        };
        setUser(profile);
        setIsAdmin(profile.is_admin);
        setSession({ user: profile, access_token: token });
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      logout();
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      const { token, user: userData } = data;

      // Check 2FA (Not fully implemented on backend yet, but keep structure)
      // if (userData.two_factor_enabled) { ... }

      localStorage.setItem('token', token);

      const profile: User = {
        ...userData,
        balance: userData.balance || 0,
        wallet_balance: userData.balance || 0, // Deprecated
        is_admin: userData.role === 'admin'
      };

      setUser(profile);
      setSession({ user: profile, access_token: token });
      setIsAdmin(profile.is_admin);

    } catch (error: any) {
      console.error('Login error:', error);
      throw error.response?.data?.error || error;
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
    fullName: string,
    referralCode?: string
  ) => {
    try {
      await api.post('/auth/register', {
        email,
        password,
        username,
        full_name: fullName,
        referral_code: referralCode
      });

      // Auto login or ask to login? Original did no-confirm logic? 
      // Auto login after registration
      await login(email, password);

    } catch (error: any) {
      console.error('Register error:', error);
      throw error.response?.data?.error || error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('sb_session'); // clear legacy
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  // 2FA methods stubs for now to avoid breaking UI consumers
  const completeTwoFactorVerification = async () => { };
  const cancelTwoFactorVerification = async () => { };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAdmin,
    showTwoFactorVerification,
    twoFactorData,
    login,
    register,
    logout,
    refreshUser,
    completeTwoFactorVerification,
    cancelTwoFactorVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showTwoFactorVerification && twoFactorData && (
        <TwoFactorVerification
          secret={twoFactorData.secret}
          backupCodes={twoFactorData.backupCodes}
          userEmail={twoFactorData.email}
          onSuccess={completeTwoFactorVerification}
          onCancel={cancelTwoFactorVerification}
        />
      )}
    </AuthContext.Provider>
  );
};
