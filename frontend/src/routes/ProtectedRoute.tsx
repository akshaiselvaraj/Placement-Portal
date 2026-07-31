import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { RoleType } from '@/lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleType[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as RoleType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
