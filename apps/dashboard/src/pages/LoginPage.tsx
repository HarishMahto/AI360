import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Divider, Alert, CircularProgress, Stack, Link, Chip
} from '@mui/material';
import {
  Google as GoogleIcon,
  Person as PersonIcon,
  ManageAccounts as ManagerIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as ExecIcon,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, type UserRole } from '../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

const ROLE_ROUTES: Record<UserRole, string> = {
  EMPLOYEE: '/dashboard/employee',
  MANAGER: '/dashboard/manager',
  ADMIN: '/dashboard/admin',
  EXECUTIVE: '/dashboard/executive',
};

const DEMO_ACCOUNTS = [
  {
    role: 'EMPLOYEE' as UserRole,
    label: 'Employee',
    email: 'employee@ai360.io',
    desc: 'AI Chat, Prompt Studio, Analytics',
    icon: PersonIcon,
    color: '#2563EB',
    soft: 'rgba(37,99,235,0.08)',
    route: '/dashboard/employee',
  },
  {
    role: 'MANAGER' as UserRole,
    label: 'Manager',
    email: 'manager@ai360.io',
    desc: 'Team Analytics, FinOps, Reports',
    icon: ManagerIcon,
    color: '#0D9488',
    soft: 'rgba(13,148,136,0.08)',
    route: '/dashboard/manager',
  },
  {
    role: 'EXECUTIVE' as UserRole,
    label: 'Executive',
    email: 'executive@ai360.io',
    desc: 'Org ROI, Dept Rankings, Forecast',
    icon: ExecIcon,
    color: '#7C3AED',
    soft: 'rgba(124,58,237,0.08)',
    route: '/dashboard/executive',
  },
  {
    role: 'ADMIN' as UserRole,
    label: 'Admin',
    email: 'admin@ai360.io',
    desc: 'Users, Providers, Budgets, Settings',
    icon: AdminIcon,
    color: '#D97706',
    soft: 'rgba(217,119,6,0.08)',
    route: '/dashboard/admin',
  },
];

export default function LoginPage() {
  const { isAuthenticated, isLoading, role, signInWithEmail, signUpWithEmail, signInWithGoogle, loginAsDemoUser } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPLOYEE');
  const [authError, setAuthError] = useState<string | null>(null);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'employee@ai360.io', password: 'Password123' },
  });

  if (!isLoading && isAuthenticated && role) {
    return <Navigate to={ROLE_ROUTES[role] ?? '/dashboard/employee'} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(data.email, data.password, selectedRole);
      } else {
        await signInWithEmail(data.email, data.password, selectedRole);
      }
      navigate(ROLE_ROUTES[selectedRole] ?? '/dashboard/employee');
    } catch (err: any) {
      setAuthError(err?.message ?? 'Authentication failed.');
    }
  };

  const handleDemoLink = (demoRole: UserRole, email: string) => {
    setSelectedRole(demoRole);
    setValue('email', email);
    setValue('password', 'Password123');
    loginAsDemoUser(demoRole);
    navigate(ROLE_ROUTES[demoRole]);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
      
      {/* ── LEFT FORM PANEL ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: { xs: 3, sm: 6, md: 8 },
          py: { xs: 3, md: 5 },
          maxWidth: { xs: '100%', md: '50%' },
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Brand */}
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              component="img"
              src="/logo.png"
              alt="AI360 Logo"
              sx={{ height: 28, width: 28, borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
            />
            <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#1A1D23', letterSpacing: '-0.025em' }}>
              AI360
            </Typography>
          </Stack>
        </Box>

        {/* FORM */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          sx={{ maxWidth: 420, width: '100%', mx: 'auto', my: 'auto' }}
        >
          <AnimatePresence mode="wait">
            <Box
              component={motion.div}
              key={isSignUp ? 'signup-head' : 'signin-head'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              sx={{ mb: 4 }}
            >
              <Typography sx={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D23', lineHeight: 1.2 }}>
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </Typography>
              <Typography sx={{ fontSize: '13.5px', color: '#6B7280', mt: 0.75 }}>
                {isSignUp ? 'Sign up for your enterprise workspace' : 'Sign in to your enterprise workspace'}
              </Typography>
            </Box>
          </AnimatePresence>

          {/* Role selector */}
          <Box sx={{ p: '3px', bgcolor: '#F0F2F5', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', display: 'flex', mb: 3 }}>
            {(['EMPLOYEE', 'MANAGER', 'ADMIN', 'EXECUTIVE'] as UserRole[]).map((r) => {
              const isSelected = selectedRole === r;
              return (
                <Button
                  key={r}
                  disableElevation
                  onClick={() => setSelectedRole(r)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    textTransform: 'capitalize',
                    fontSize: '11.5px',
                    fontWeight: isSelected ? 600 : 500,
                    borderRadius: '7px',
                    p: '6px 4px',
                    color: isSelected ? '#1A1D23' : '#6B7280',
                    bgcolor: isSelected ? '#FFFFFF' : 'transparent',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                    '&:hover': { bgcolor: isSelected ? '#FFFFFF' : 'rgba(0,0,0,0.04)' },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </Button>
              );
            })}
          </Box>

          {authError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '0.8rem' }}>
              {authError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={1.5}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Email address"
                    fullWidth
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#F0F2F5',
                        borderRadius: '10px',
                        fontSize: '13px',
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: '1px solid rgba(0,0,0,0.1)' },
                        '&.Mui-focused fieldset': { border: '1.5px solid #2563EB' },
                      },
                      '& .MuiOutlinedInput-input': { p: '12px 14px' }
                    }}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    placeholder="Password"
                    fullWidth
                    size="small"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#F0F2F5',
                        borderRadius: '10px',
                        fontSize: '13px',
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: '1px solid rgba(0,0,0,0.1)' },
                        '&.Mui-focused fieldset': { border: '1.5px solid #2563EB' },
                      },
                      '& .MuiOutlinedInput-input': { p: '12px 14px' }
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  height: 44,
                  mt: 0.5,
                  borderRadius: '10px',
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '14px',
                  boxShadow: '0 1px 4px rgba(37,99,235,0.3)',
                  '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
                  transition: 'all 0.2s ease',
                }}
              >
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : (isSignUp ? 'Sign up' : 'Sign in')}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5, color: '#9CA3AF', fontSize: '12px' }}>or</Divider>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => signInWithGoogle(selectedRole)}
            startIcon={<GoogleIcon sx={{ fontSize: 18 }} />}
            sx={{
              height: 42,
              borderRadius: '10px',
              color: '#1A1D23',
              borderColor: 'rgba(0,0,0,0.12)',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '13px',
              '&:hover': { borderColor: 'rgba(0,0,0,0.22)', bgcolor: '#F0F2F5' },
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link
              component="button"
              underline="none"
              onClick={() => setIsSignUp(!isSignUp)}
              sx={{ color: '#6B7280', fontSize: '13px', '&:hover': { color: '#1A1D23' } }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Link>
          </Box>
        </Box>

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
            © 2026 AI360 Inc. — Enterprise AI Intelligence Platform
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT BRAND PANEL ── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          bgcolor: '#F5F7FA',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderLeft: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440, px: 5 }}>
          {/* Hero brand */}
          <Box sx={{ mb: 5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="AI360 Platform Logo"
              sx={{
                height: 72,
                width: 72,
                borderRadius: '16px',
                mb: 2,
                boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
              }}
            />
            <Typography sx={{ fontSize: '3.2rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#1A1D23', lineHeight: 1.05 }}>
              AI360
            </Typography>
            <Typography sx={{ fontSize: '15px', fontWeight: 500, color: '#6B7280', mt: 0.75 }}>
              Enterprise AI Intelligence Platform
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
              {['Multi-Model AI', 'FinOps', 'Analytics', 'Governance'].map((pill) => (
                <Chip
                  key={pill}
                  label={pill}
                  size="small"
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#374151',
                    fontWeight: 500,
                    fontSize: '11px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '6px',
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Stats row */}
          <Stack direction="row" spacing={0} sx={{ mb: 5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {[
              { val: '23', label: 'AI Models' },
              { val: '$2.4M', label: 'Saved' },
              { val: '94%', label: 'Adoption' },
            ].map((stat, i) => (
              <Box key={i} sx={{ flex: 1, textAlign: 'center', py: 2, px: 1, borderRight: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D23', lineHeight: 1.2 }}>
                  {stat.val}
                </Typography>
                <Typography sx={{ fontSize: '10.5px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, mt: 0.25 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Demo access section */}
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 2 }}>
              Quick access — demo accounts
            </Typography>
            <Stack spacing={1.5}>
              {DEMO_ACCOUNTS.map((demo, idx) => {
                const Icon = demo.icon;
                return (
                  <Box
                    key={demo.role}
                    component={motion.div}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.07 }}
                    onClick={() => handleDemoLink(demo.role, demo.email)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: '12px 16px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.07)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: demo.color,
                        bgcolor: demo.soft,
                        boxShadow: `0 4px 12px rgba(0,0,0,0.06)`,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '9px',
                      bgcolor: demo.soft,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon sx={{ fontSize: 18, color: demo.color }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1A1D23', lineHeight: 1.3 }}>
                        {demo.label} Dashboard
                      </Typography>
                      <Typography sx={{ fontSize: '11.5px', color: '#6B7280', mt: 0.25 }}>
                        {demo.desc}
                      </Typography>
                    </Box>
                    <ArrowForward sx={{ fontSize: 16, color: '#9CA3AF', flexShrink: 0 }} />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        <Typography sx={{ position: 'absolute', bottom: 28, fontSize: '11px', color: '#9CA3AF' }}>
          No account required for demo access
        </Typography>
      </Box>
    </Box>
  );
}
