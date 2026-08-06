import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Box,
  Tooltip, Popover, List, ListItem, ListItemText, Stack
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const NOTIFICATIONS = [
  { id: 1, title: 'Budget Alert', desc: 'Team budget is 80% utilized', time: '5m ago', color: '#D97706' },
  { id: 2, title: 'New Recommendation', desc: 'Switch to Gemini Flash to save 78%', time: '1h ago', color: '#059669' },
  { id: 3, title: 'Daily Summary', desc: 'Your AI usage report for today is ready', time: '2h ago', color: '#2563EB' },
];

interface TopbarProps {
  title: string;
  subtitle?: string;
  collapsed?: boolean;
}

export default function Topbar({ title, subtitle, collapsed = false }: TopbarProps) {
  const navigate = useNavigate();
  const { authUser, signOut } = useAuth();
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [avatarAnchor, setAvatarAnchor] = useState<null | HTMLElement>(null);

  const sidebarWidth = collapsed ? 58 : 220;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        right: 0,
        left: { xs: 0, md: `${sidebarWidth}px` },
        width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
        transition: 'left 0.3s ease, width 0.3s ease',
        zIndex: 1100,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.09)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        px: { xs: 2, md: 3.5 },
        py: 0,
        margin: 0,
        height: 70,
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: '70px !important', height: 70, justifyContent: 'space-between' }}>
        
        {/* LEFT: TITLE & SUBTITLE */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1D2E', lineHeight: 1.25, letterSpacing: '-0.015em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '0.875rem', color: '#4B5563', mt: 0.5, lineHeight: 1.2, fontWeight: 400 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* RIGHT: GATEWAY STATUS, NOTIFICATIONS & USER PROFILE */}
        <Stack direction="row" spacing={2.5} alignItems="center">
          
          {/* Active Status Pill */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, px: 2, py: 0.875, borderRadius: '20px', bgcolor: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.18)' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#059669', animation: 'pulse 2s infinite' }} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669', letterSpacing: '-0.01em' }}>
              Gateway Active
            </Typography>
          </Box>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                color: '#4B5563',
                bgcolor: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.06)',
                '&:hover': { bgcolor: '#F0F4F8', color: '#1A1D2E', borderColor: 'rgba(31,90,166,0.2)' },
                transition: 'all 0.2s ease',
              }}
            >
              <Badge badgeContent={NOTIFICATIONS.length} sx={{ '& .MuiBadge-badge': { bgcolor: '#DC2626', color: '#FFF', fontSize: '11px', fontWeight: 700, height: 18, minWidth: 18, borderRadius: '9px' } }}>
                <NotificationsIcon sx={{ fontSize: 24 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile User Badge */}
          <Tooltip title={authUser?.displayName ?? 'Profile'}>
            <Box
              onClick={(e) => setAvatarAnchor(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 0.75,
                pr: 2,
                borderRadius: '24px',
                bgcolor: 'rgba(31,90,166,0.06)',
                border: '1px solid rgba(31,90,166,0.12)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(31,90,166,0.12)', borderColor: 'rgba(31,90,166,0.25)' }
              }}
            >
              <Avatar
                src={authUser?.photoURL ?? undefined}
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '15px',
                  fontWeight: 700,
                  bgcolor: '#1F5AA6',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(31,90,166,0.3)',
                }}
              >
                {authUser?.displayName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1A1D2E', lineHeight: 1.2 }}>
                  {authUser?.displayName || 'User'}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.2 }}>
                  {authUser?.email?.split('@')[0] || 'Member'}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        </Stack>
      </Toolbar>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 320, mt: 1, bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1A1D23' }}>Notifications</Typography>
        </Box>
        <List disablePadding>
          {NOTIFICATIONS.map((n) => (
            <ListItem key={n.id} sx={{ py: 1.5, px: 2, cursor: 'pointer', '&:hover': { bgcolor: '#F0F2F5' } }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: n.color, flexShrink: 0, mt: 0.5, mr: 1.5 }} />
              <ListItemText
                primary={n.title}
                secondary={n.desc}
                primaryTypographyProps={{ sx: { fontSize: '13px', fontWeight: 500, color: '#1A1D23', mb: 0.25 } }}
                secondaryTypographyProps={{ sx: { fontSize: '12px', color: '#6B7280' } }}
              />
              <Typography sx={{ color: '#9CA3AF', ml: 1, flexShrink: 0, fontSize: '11px' }}>{n.time}</Typography>
            </ListItem>
          ))}
        </List>
      </Popover>

      {/* Profile Popover */}
      <Popover
        open={Boolean(avatarAnchor)}
        anchorEl={avatarAnchor}
        onClose={() => setAvatarAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 240, mt: 1, bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' } }}
      >
        <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <Avatar src={authUser?.photoURL ?? undefined} sx={{ width: 40, height: 40, bgcolor: 'rgba(37,99,235,0.10)', color: '#2563EB', fontSize: '14px', fontWeight: 700 }}>
            {authUser?.displayName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1A1D23' }}>{authUser?.displayName || 'User'}</Typography>
            <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{authUser?.email}</Typography>
          </Box>
        </Box>
        <List disablePadding sx={{ p: 1 }}>
          <ListItem sx={{ borderRadius: 1.5, px: 1.5, py: 1, cursor: 'pointer', '&:hover': { bgcolor: '#F0F2F5' } }} onClick={() => { window.open('https://ai-360-dashboard.vercel.app/docs', '_blank'); setAvatarAnchor(null); }}>
            <CodeIcon sx={{ fontSize: 18, color: '#2563EB', mr: 1.5 }} />
            <Typography sx={{ fontSize: '13px', color: '#1A1D23', fontWeight: 500 }}>API Docs (Swagger UI)</Typography>
          </ListItem>
          <ListItem sx={{ borderRadius: 1.5, px: 1.5, py: 1, cursor: 'pointer', '&:hover': { bgcolor: '#F0F2F5' } }} onClick={() => { navigate('/dashboard/admin/settings'); setAvatarAnchor(null); }}>
            <SettingsIcon sx={{ fontSize: 18, color: '#6B7280', mr: 1.5 }} />
            <Typography sx={{ fontSize: '13px', color: '#1A1D23' }}>Settings</Typography>
          </ListItem>
          <ListItem sx={{ borderRadius: 1.5, px: 1.5, py: 1, cursor: 'pointer', '&:hover': { bgcolor: '#F0F2F5' } }} onClick={() => { signOut(); setAvatarAnchor(null); }}>
            <LogoutIcon sx={{ fontSize: 18, color: '#DC2626', mr: 1.5 }} />
            <Typography sx={{ fontSize: '13px', color: '#DC2626' }}>Sign Out</Typography>
          </ListItem>
        </List>
      </Popover>
    </AppBar>
  );
}
