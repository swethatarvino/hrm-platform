import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UnauthorizedPage } from './UnauthorizedPage';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  resourceName?: string;
  children: React.ReactNode;
  onNavigateFallback?: () => void;
}

/**
 * Route protection guard checking authentication and role authorization.
 * If unauthorized, renders the standard 403 UnauthorizedPage.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  resourceName = 'protected module',
  children,
  onNavigateFallback,
}) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return null; // Will trigger login page in App root
  }

  // Check role authorization if restricted
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <UnauthorizedPage
        moduleName={resourceName}
        onReturn={onNavigateFallback}
      />
    );
  }

  return <>{children}</>;
};
