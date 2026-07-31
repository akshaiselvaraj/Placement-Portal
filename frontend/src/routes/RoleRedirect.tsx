import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { ROLE_DASHBOARD_ROUTES } from '@/lib/constants';
import type { RoleType } from '@/lib/constants';

export function RoleRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardRoute = ROLE_DASHBOARD_ROUTES[user.role as RoleType];

  if (dashboardRoute) {
    return <Navigate to={dashboardRoute} replace />;
  }

  return <Navigate to="/login" replace />;
}
