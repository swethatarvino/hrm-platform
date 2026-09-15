import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, isFounder, isEmployee, CreateEmployeeInput, DispatchedEmail } from '../types';
import { initialUsers } from '../services/mockData';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: User;
  role: UserRole;
  isFounder: boolean;
  isEmployee: boolean;
  isAuthenticated: boolean;
  allUsers: User[];
  login: (identifier: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  createEmployee: (input: CreateEmployeeInput) => Promise<{
    success: boolean;
    error?: string;
    tempPassword?: string;
    employeeId?: string;
    user?: User;
    dispatchedEmail?: DispatchedEmail;
  }>;
  resendWelcomeEmail: (userId: string) => Promise<{ success: boolean; error?: string }>;
  mustChangePassword: boolean;
  removeEmployee: (targetUserId: string) => { success: boolean; error?: string };
  updateAvatar: (avatarUrl: string) => void;
  updateUserProfile: (updates: { name?: string; department?: string; designation?: string; avatarUrl?: string }) => void;
  refreshUsersList: () => void;
  requestPasswordReset: (identifier: string) => { success: boolean; error?: string; personalEmail?: string; message?: string; code?: string };
  verifyAndResetPassword: (code: string, newPassword: string) => { success: boolean; error?: string; message?: string };
  changePassword: (userId: string, currentPassword: string, newPassword: string) => { success: boolean; error?: string; message?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedUser = localStorage.getItem('hrm_session_user');
      return savedUser ? JSON.parse(savedUser) : initialUsers[0];
    } catch {
      return initialUsers[0];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('hrm_is_authenticated');
      const token = localStorage.getItem('hrm_session_token');
      if (savedAuth === 'true' && token) {
        authService.verifyToken(token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const [usersList, setUsersList] = useState<User[]>(() => authService.getAllUsers());
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(() => {
    const credential = authService.getCredentials().find((item) => item.userId === currentUser.id);
    return credential?.mustChangePassword === true;
  });

  const role: UserRole = currentUser.role;
  const isCurrentUserFounder = isFounder(currentUser.role);
  const isCurrentUserEmployee = isEmployee(currentUser.role);

  const refreshUsersList = () => {
    setUsersList(authService.getAllUsers());
  };

  const login = (identifier: string, password?: string): { success: boolean; error?: string } => {
    try {
      const session = authService.authenticate(identifier, password);
      setCurrentUser(session.user);
      setIsAuthenticated(true);
      localStorage.setItem('hrm_session_user', JSON.stringify(session.user));
      localStorage.setItem('hrm_session_token', session.token);
      localStorage.setItem('hrm_is_authenticated', 'true');
      setMustChangePassword(session.mustChangePassword === true);
      refreshUsersList();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid email or password.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMustChangePassword(false);
    localStorage.removeItem('hrm_session_token');
    localStorage.setItem('hrm_is_authenticated', 'false');
  };

  const createEmployee = async (
    input: CreateEmployeeInput
  ): Promise<{ success: boolean; error?: string; tempPassword?: string; employeeId?: string; user?: User; dispatchedEmail?: DispatchedEmail }> => {
    try {
      const result = await authService.createEmployeeByAdmin(currentUser, input);
      refreshUsersList();
      return { success: true, ...result };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create employee account.' };
    }
  };

  const resendWelcomeEmail = (userId: string) => authService.resendWelcomeEmail(userId);

  const removeEmployee = (targetUserId: string): { success: boolean; error?: string } => {
    try {
      const result = authService.removeEmployeeByAdmin(currentUser, targetUserId);
      refreshUsersList();
      return result;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to remove employee.' };
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    const updated = authService.updateUserPhoto(currentUser.id, avatarUrl);
    if (updated) {
      setCurrentUser({ ...updated });
      refreshUsersList();
    }
  };

  const updateUserProfile = (updates: { name?: string; department?: string; designation?: string; avatarUrl?: string }) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('hrm_session_user', JSON.stringify(updated));
    if (updates.avatarUrl) {
      authService.updateUserPhoto(currentUser.id, updates.avatarUrl);
    }
    refreshUsersList();
  };

  const requestPasswordReset = (identifier: string) => {
    try {
      const res = authService.requestPasswordReset(identifier);
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to request password reset.' };
    }
  };

  const verifyAndResetPassword = (code: string, newPassword: string) => {
    try {
      const res = authService.verifyAndResetPassword(code, newPassword);
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to reset password.' };
    }
  };

  const changePassword = (userId: string, currentPassword: string, newPassword: string) => {
    try {
      const res = authService.changePassword(userId, currentPassword, newPassword);
      if (res.success && userId === currentUser.id) setMustChangePassword(false);
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to change password.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isFounder: isCurrentUserFounder,
        isEmployee: isCurrentUserEmployee,
        isAuthenticated,
        allUsers: usersList,
        login,
        logout,
        createEmployee,
        removeEmployee,
        updateAvatar,
        updateUserProfile,
        refreshUsersList,
        requestPasswordReset,
        verifyAndResetPassword,
        changePassword,
        resendWelcomeEmail,
        mustChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
