// AI360 Dashboard – Auth Context with Demo Credentials & Role Support
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import axios from 'axios';
import { auth, googleProvider } from '../firebase';

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'EXECUTIVE';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  organizationId: string;
  departmentId: string | null;
  teamId: string | null;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  authUser: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  signInWithEmail: (email: string, password: string, selectedRole?: UserRole) => Promise<void>;
  signInWithGoogle: (selectedRole?: UserRole) => Promise<void>;
  signUpWithEmail: (email: string, password: string, selectedRole?: UserRole) => Promise<void>;
  loginAsDemoUser: (role: UserRole) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const DEMO_PROFILES: Record<UserRole, AuthUser> = {
  EMPLOYEE: {
    uid: 'demo-emp-123',
    email: 'employee@ai360.io',
    displayName: 'Sarah Jenkins',
    photoURL: 'https://i.pravatar.cc/150?u=sarah',
    role: 'EMPLOYEE',
    organizationId: 'org-demo',
    departmentId: 'dept-engineering',
    teamId: 'team-frontend'
  },
  MANAGER: {
    uid: 'demo-mgr-456',
    email: 'manager@ai360.io',
    displayName: 'Marcus Chen',
    photoURL: 'https://i.pravatar.cc/150?u=marcus',
    role: 'MANAGER',
    organizationId: 'org-demo',
    departmentId: 'dept-engineering',
    teamId: 'team-lead'
  },
  EXECUTIVE: {
    uid: 'demo-exec-789',
    email: 'executive@ai360.io',
    displayName: 'Elena Rodriguez',
    photoURL: 'https://i.pravatar.cc/150?u=elena',
    role: 'EXECUTIVE',
    organizationId: 'org-demo',
    departmentId: 'dept-executive',
    teamId: null
  },
  ADMIN: {
    uid: 'demo-admin-999',
    email: 'admin@ai360.io',
    displayName: 'David Kim (Super Admin)',
    photoURL: 'https://i.pravatar.cc/150?u=david',
    role: 'ADMIN',
    organizationId: 'org-demo',
    departmentId: null,
    teamId: null
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const cachedRole = localStorage.getItem('ai360_demo_role') as UserRole | null;
    return cachedRole ? DEMO_PROFILES[cachedRole] : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('ai360_token'));
  const [isLoading, setIsLoading] = useState(false);

  const loginAsDemoUser = (targetRole: UserRole) => {
    const profile = DEMO_PROFILES[targetRole];
    setAuthUser(profile);
    setAccessToken(`demo-token-${targetRole.toLowerCase()}`);
    localStorage.setItem('ai360_demo_role', targetRole);
    localStorage.setItem('ai360_token', `demo-token-${targetRole.toLowerCase()}`);
  };

  const exchangeToken = async (fbUser: FirebaseUser, fallbackRole: UserRole = 'EMPLOYEE'): Promise<void> => {
    try {
      const idToken = await fbUser.getIdToken(false);
      const response = await axios.post(`${BACKEND_URL}/auth/login`, { id_token: idToken });
      const { access_token, user } = response.data;
      setAccessToken(access_token);
      setAuthUser({
        uid: user.id,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url ?? null,
        role: (user.role as UserRole) || fallbackRole,
        organizationId: user.organization_id,
        departmentId: user.department_id ?? null,
        teamId: user.team_id ?? null,
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      localStorage.setItem('ai360_token', access_token);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await exchangeToken(fbUser);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string, selectedRole: UserRole = 'EMPLOYEE') => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await exchangeToken(cred.user, selectedRole);
  };

  const signUpWithEmail = async (email: string, password: string, selectedRole: UserRole = 'EMPLOYEE') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await exchangeToken(cred.user, selectedRole);
  };

  const signInWithGoogle = async (selectedRole: UserRole = 'EMPLOYEE') => {
    const cred = await signInWithPopup(auth, googleProvider);
    await exchangeToken(cred.user, selectedRole);
  };

  const signOut = async () => {
    localStorage.removeItem('ai360_demo_role');
    localStorage.removeItem('ai360_token');
    setAuthUser(null);
    setAccessToken(null);
    delete axios.defaults.headers.common['Authorization'];
    await firebaseSignOut(auth).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        authUser,
        accessToken,
        isLoading,
        isAuthenticated: !!authUser,
        role: authUser?.role ?? null,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsDemoUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useCurrentUser(): AuthUser | null {
  return useAuth().authUser;
}

export function useRBAC() {
  const { role } = useAuth();
  return {
    isEmployee: role === 'EMPLOYEE',
    isManager: role === 'MANAGER',
    isAdmin: role === 'ADMIN',
    isExecutive: role === 'EXECUTIVE',
    hasRole: (...roles: UserRole[]) => role !== null && roles.includes(role),
    hasMinRole: (minRole: UserRole) => {
      const hierarchy: Record<UserRole, number> = { EMPLOYEE: 1, MANAGER: 2, EXECUTIVE: 3, ADMIN: 4 };
      return role !== null && hierarchy[role] >= hierarchy[minRole];
    },
  };
}
