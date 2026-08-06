import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Divider, Alert, CircularProgress, Stack, Link, InputAdornment, IconButton
} from '@mui/material';
import {
  Google as GoogleIcon,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  VisibilityOutlined as VisibilityIcon,
  VisibilityOffOutlined as VisibilityOffIcon,
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
  { role: 'EMPLOYEE' as UserRole, label: 'Employee', email: 'employee@ai360.io', color: '#2563EB' },
  { role: 'MANAGER' as UserRole, label: 'Manager', email: 'manager@ai360.io', color: '#0D9488' },
  { role: 'EXECUTIVE' as UserRole, label: 'Executive', email: 'executive@ai360.io', color: '#7C3AED' },
  { role: 'ADMIN' as UserRole, label: 'Admin', email: 'admin@ai360.io', color: '#D97706' },
];

export default function LoginPage() {
  const { isAuthenticated, isLoading, role, signInWithEmail, signUpWithEmail, signInWithGoogle, loginAsDemoUser } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPLOYEE');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'employee@ai360.io', password: 'Password123' },
  });

  if (!isLoading && isAuthenticated && role) {
    return <Navigate to={ROLE_ROUTES[role] ?? '/dashboard/employee'} replace />;
  }

  const navigateWithTransition = (path: string) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 280);
  };

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(data.email, data.password, selectedRole);
      } else {
        await signInWithEmail(data.email, data.password, selectedRole);
      }
      navigateWithTransition(ROLE_ROUTES[selectedRole] ?? '/dashboard/employee');
    } catch (err: any) {
      setAuthError(err?.message ?? 'Authentication failed.');
    }
  };

  const handleDemoLink = (demoRole: UserRole, email: string) => {
    setSelectedRole(demoRole);
    setValue('email', email);
    setValue('password', 'Password123');
    loginAsDemoUser(demoRole);
    navigateWithTransition(ROLE_ROUTES[demoRole]);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #A8DAFF 0%, #C4E6FF 35%, #E2F2FF 70%, #F4F9FF 100%)',
        p: 2,
      }}
    >
      {/* Background Radial Light Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          opacity: 0.6,
          background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)',
        }}
      />

      {/* Bottom Background Soft Clouds Graphic */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -2,
          left: 0,
          right: 0,
          width: '100%',
          height: { xs: 120, sm: 160, md: 200 },
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <svg viewBox="0 0 1440 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
          {/* Back cloud layer */}
          <path
            d="M0,150 C180,110 380,130 540,90 C700,50 900,85 1060,65 C1220,45 1360,100 1440,110 L1440,220 L0,220 Z"
            fill="rgba(255, 255, 255, 0.45)"
          />
          {/* Mid cloud layer */}
          <path
            d="M-50,165 C140,120 300,105 470,125 C640,145 820,95 1000,105 C1180,115 1340,75 1490,130 L1490,220 L-50,220 Z"
            fill="rgba(255, 255, 255, 0.75)"
          />
          {/* Foreground cloud layer */}
          <path
            d="M0,185 C200,135 350,155 560,125 C770,95 920,135 1120,115 C1320,95 1400,145 1440,155 L1440,220 L0,220 Z"
            fill="#FFFFFF"
          />
        </svg>
      </Box>

      {/* Floating Centered Glass Card Container */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={isExiting ? { opacity: 0, scale: 0.95, y: -16 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: { xs: '92vw', sm: 560, md: 620 },
          borderRadius: '28px',
          background: 'linear-gradient(180deg, rgba(235, 248, 255, 0.88) 0%, rgba(255, 255, 255, 0.94) 22%, rgba(255, 255, 255, 0.96) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 20px 60px rgba(0, 70, 150, 0.12), 0 4px 20px rgba(0, 0, 0, 0.04)',
          px: { xs: 3.5, sm: 5 },
          py: { xs: 4, sm: 4.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Top Logo Container (Increased Size) */}
        <Box
          component={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          sx={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            boxShadow: '0 6px 20px rgba(0,70,150,0.10), 0 2px 6px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
          }}
        >
          <Box component="img" src="/logo.png" alt="AI360 Logo" sx={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover' }} />
        </Box>

        {/* Dynamic Header (Subtitle removed as requested) */}
        <AnimatePresence mode="wait">
          <Box
            component={motion.div}
            key={isSignUp ? 'signup-head' : 'signin-head'}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
            sx={{ textAlign: 'center', mb: 3, width: '100%' }}
          >
            <Typography sx={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#111827', lineHeight: 1.2 }}>
              {isSignUp ? 'Create an account' : 'Sign in with email'}
            </Typography>
          </Box>
        </AnimatePresence>

        {/* Role Selector Segment */}
        <Box sx={{ width: '100%', p: '3px', bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '12px', display: 'flex', mb: 3 }}>
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
                  borderRadius: '9px',
                  py: '6px',
                  px: '2px',
                  color: isSelected ? '#111827' : '#6B7280',
                  bgcolor: isSelected ? '#FFFFFF' : 'transparent',
                  boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  '&:hover': { bgcolor: isSelected ? '#FFFFFF' : 'rgba(0,0,0,0.03)' },
                  transition: 'all 0.2s ease',
                }}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </Button>
            );
          })}
        </Box>

        {authError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2.5, borderRadius: 2, fontSize: '0.8rem' }}>
            {authError}
          </Alert>
        )}

        {/* Beautiful Form Inputs with Left Field Names */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
          <Stack spacing={2}>
            
            {/* Email Field Row */}
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#EEF1F4',
                  borderRadius: '14px',
                  px: 2,
                  py: 0.5,
                  border: errors.email ? '1.5px solid #FF3B30' : '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:focus-within': {
                    bgcolor: '#FFFFFF',
                    borderColor: '#2563EB',
                    boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
                  },
                }}
              >
                <Typography sx={{ width: 80, flexShrink: 0, fontSize: '13.5px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>
                  Email
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ my: 1, mr: 1.5, borderColor: 'rgba(0,0,0,0.08)' }} />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      placeholder="name@company.com"
                      fullWidth
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInput-root': { fontSize: '14px', color: '#111827', py: 0.75 }
                      }}
                    />
                  )}
                />
              </Box>
              {errors.email && (
                <Typography sx={{ fontSize: '12px', color: '#FF3B30', mt: 0.5, ml: 1, textAlign: 'left' }}>
                  {errors.email.message}
                </Typography>
              )}
            </Box>

            {/* Password Field Row */}
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#EEF1F4',
                  borderRadius: '14px',
                  px: 2,
                  py: 0.5,
                  border: errors.password ? '1.5px solid #FF3B30' : '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:focus-within': {
                    bgcolor: '#FFFFFF',
                    borderColor: '#2563EB',
                    boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
                  },
                }}
              >
                <Typography sx={{ width: 80, flexShrink: 0, fontSize: '13.5px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>
                  Password
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ my: 1, mr: 1.5, borderColor: 'rgba(0,0,0,0.08)' }} />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      fullWidth
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#9CA3AF', mr: 0.5 }}>
                              {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInput-root': { fontSize: '14px', color: '#111827', py: 0.75 }
                      }}
                    />
                  )}
                />
              </Box>
              {errors.password && (
                <Typography sx={{ fontSize: '12px', color: '#FF3B30', mt: 0.5, ml: 1, textAlign: 'left' }}>
                  {errors.password.message}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -0.5 }}>
              <Link
                component="button"
                type="button"
                underline="none"
                onClick={() => setAuthError('Demo mode: Click any demo role link below or enter credentials.')}
                sx={{ fontSize: '12px', color: '#6B7280', '&:hover': { color: '#111827' } }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{
                height: 46,
                borderRadius: '12px',
                bgcolor: '#1E2028',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#000000', boxShadow: '0 6px 16px rgba(0,0,0,0.25)' },
                transition: 'all 0.2s ease',
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isSignUp ? 'btn-signup' : 'btn-signin'}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isSignUp ? 'Get Started' : 'Sign in'}
                  </motion.span>
                </AnimatePresence>
              )}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ width: '100%', my: 2.5, color: '#9CA3AF', fontSize: '12px', '&::before, &::after': { borderTop: '1px dotted rgba(0,0,0,0.15)' } }}>
          Or sign in with
        </Divider>

        {/* Social / Demo Button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            loginAsDemoUser(selectedRole);
            navigateWithTransition(ROLE_ROUTES[selectedRole]);
          }}
          startIcon={<GoogleIcon sx={{ fontSize: 18, color: '#EA4335' }} />}
          sx={{
            height: 42,
            borderRadius: '12px',
            color: '#111827',
            bgcolor: '#FFFFFF',
            borderColor: 'rgba(0,0,0,0.1)',
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '13px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            '&:hover': { borderColor: 'rgba(0,0,0,0.2)', bgcolor: '#FAFAFA' },
          }}
        >
          Continue with Google
        </Button>

        {/* Sign in / Sign up Toggle */}
        <Box sx={{ width: '100%', textAlign: 'center', mt: 2.5 }}>
          <Link
            component="button"
            type="button"
            underline="none"
            onClick={() => setIsSignUp(!isSignUp)}
            sx={{ color: '#6B7280', fontSize: '13px', '&:hover': { color: '#111827' } }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </Link>
        </Box>

        {/* Quick Access links centrally aligned below signup URL */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 3, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
          <Typography
            align="center"
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#9CA3AF',
              mb: 1,
              display: 'block',
              width: '100%',
              textAlign: 'center',
            }}
          >
            Quick Demo Access
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.25,
              width: '100%',
              textAlign: 'center',
            }}
          >
            {DEMO_ACCOUNTS.map((demo, idx) => (
              <Box key={demo.role} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
                {idx > 0 && <Typography sx={{ fontSize: '12px', color: '#D1D5DB', userSelect: 'none' }}>•</Typography>}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => handleDemoLink(demo.role, demo.email)}
                  sx={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: demo.color,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { opacity: 0.75 }
                  }}
                >
                  {demo.label}
                </Link>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Copyright */}
        <Box sx={{ width: '100%', textAlign: 'center', mt: 3 }}>
          <Typography align="center" sx={{ fontSize: '11px', color: '#9CA3AF' }}>
            © 2026 AI360 Inc. — Enterprise AI Intelligence Platform
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}
