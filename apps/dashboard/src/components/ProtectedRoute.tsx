// AI360 – Protected Route Component
// Redirects unauthenticated users to /login
// Redirects users to the correct dashboard based on their role
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0A0B14 0%, #111222 100%)',
          gap: 2,
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="AI360"
          sx={{ width: 48, height: 48, borderRadius: '12px', mb: 1, animation: 'pulse 2s infinite' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <CircularProgress sx={{ color: '#7b2cbf' }} size={32} />
        <Typography variant="body2" color="text.secondary">
          Authenticating…
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role-based access: if roles specified and user doesn't have one, redirect to their correct dashboard
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const roleRedirectMap: Record<UserRole, string> = {
      EMPLOYEE: '/dashboard/employee',
      MANAGER: '/dashboard/manager',
      ADMIN: '/dashboard/admin',
      EXECUTIVE: '/dashboard/executive',
    };
    return <Navigate to={roleRedirectMap[role] ?? '/dashboard/employee'} replace />;
  }

  return <Outlet />;
}
