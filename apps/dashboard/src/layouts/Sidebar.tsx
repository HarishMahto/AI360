import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, Box, Stack, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Tooltip, IconButton, Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
  Recommend as RecommendIcon,
  TrendingUp as ForecastIcon,
  Assessment as ReportIcon,
  Business as OrgIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  AutoAwesome as AIIcon,
  MonetizationOn as FinOpsIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 58;

interface NavGroup {
  sectionTitle: string;
  items: {
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: string;
  }[];
}

const employeeGroups: NavGroup[] = [
  {
    sectionTitle: 'MAIN NAVIGATION',
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/employee' },
      { label: 'AI Chat Workspace', icon: <ChatIcon />, path: '/dashboard/employee/chat' },
      { label: 'Prompt Studio', icon: <AIIcon />, path: '/dashboard/employee/prompt' },
      { label: 'Marketplace', icon: <StarIcon />, path: '/dashboard/employee/recommendations', badge: 'Popular' },
    ],
  },
  {
    sectionTitle: 'INTELLIGENCE & FINOPS',
    items: [
      { label: 'Analytics', icon: <AnalyticsIcon />, path: '/dashboard/employee/analytics' },
      { label: 'Recommendations', icon: <RecommendIcon />, path: '/dashboard/employee/recommendations' },
    ],
  },
];

const managerGroups: NavGroup[] = [
  {
    sectionTitle: 'MAIN NAVIGATION',
    items: [
      { label: 'Team Dashboard', icon: <DashboardIcon />, path: '/dashboard/manager' },
      { label: 'Team Analytics', icon: <AnalyticsIcon />, path: '/dashboard/manager/analytics' },
    ],
  },
  {
    sectionTitle: 'SYSTEM MANAGEMENT',
    items: [
      { label: 'AI FinOps', icon: <FinOpsIcon />, path: '/dashboard/manager/finops' },
      { label: 'Usage Forecast', icon: <ForecastIcon />, path: '/dashboard/manager/forecast' },
      { label: 'Reports', icon: <ReportIcon />, path: '/dashboard/manager/reports' },
      { label: 'Recommendations', icon: <RecommendIcon />, path: '/dashboard/manager/recommendations' },
    ],
  },
];

const executiveGroups: NavGroup[] = [
  {
    sectionTitle: 'MAIN NAVIGATION',
    items: [
      { label: 'Executive Intelligence', icon: <DashboardIcon />, path: '/dashboard/executive' },
      { label: 'AI ROI Attribution', icon: <ForecastIcon />, path: '/dashboard/executive/roi' },
    ],
  },
  {
    sectionTitle: 'SYSTEM MANAGEMENT',
    items: [
      { label: 'Dept Rankings', icon: <AnalyticsIcon />, path: '/dashboard/executive/departments' },
      { label: 'Budget Forecast', icon: <ForecastIcon />, path: '/dashboard/executive/forecast' },
      { label: 'Executive Reports', icon: <ReportIcon />, path: '/dashboard/executive/reports' },
    ],
  },
];

const adminGroups: NavGroup[] = [
  {
    sectionTitle: 'MAIN NAVIGATION',
    items: [
      { label: 'Admin Hub', icon: <DashboardIcon />, path: '/dashboard/admin' },
      { label: 'Organizations', icon: <OrgIcon />, path: '/dashboard/admin/organizations' },
      { label: 'Users & RBAC', icon: <PeopleIcon />, path: '/dashboard/admin/users' },
    ],
  },
  {
    sectionTitle: 'SYSTEM MANAGEMENT',
    items: [
      { label: 'AI Providers', icon: <AIIcon />, path: '/dashboard/admin/providers' },
      { label: 'Budgets & FinOps', icon: <FinOpsIcon />, path: '/dashboard/admin/budgets' },
      { label: 'System Settings', icon: <SettingsIcon />, path: '/dashboard/admin/settings' },
    ],
  },
];

const navGroupsByRole: Record<string, NavGroup[]> = {
  EMPLOYEE: employeeGroups,
  MANAGER: managerGroups,
  ADMIN: adminGroups,
  EXECUTIVE: executiveGroups,
};

interface SidebarProps {
  role: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const groups = navGroupsByRole[role] ?? employeeGroups;
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width,
          height: '100vh',
          margin: 0,
          top: 0,
          left: 0,
          borderRadius: 0,
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
          background: '#ECEEF2',
          borderRight: '1px solid rgba(0, 0, 0, 0.07)',
          color: '#1A1D23',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* BRAND HEADER */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            height: 52,
            px: collapsed ? 0 : 2,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              component="img"
              src="/logo.png"
              alt="AI360 Logo"
              sx={{
                height: 28,
                width: 28,
                borderRadius: '6px',
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
            />
            {!collapsed && (
              <Typography sx={{ fontSize: '16px', fontWeight: 800, color: '#1A1D23', letterSpacing: '-0.025em' }}>
                AI360
              </Typography>
            )}
          </Stack>
        </Box>

        {/* NAVIGATION ITEMS */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {groups.map((group, gIdx) => (
            <Box key={gIdx} sx={{ mb: 1 }}>
              {!collapsed && (
                <Typography
                  sx={{
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: '#9CA3AF',
                    mt: 2,
                    mb: 1,
                    pl: 1.5,
                  }}
                >
                  {group.sectionTitle}
                </Typography>
              )}
              {collapsed && gIdx !== 0 && <Box sx={{ height: 16 }} />}

              <List disablePadding>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard/employee' && location.pathname.startsWith(item.path));
                  return (
                    <ListItem key={`${item.label}-${item.path}`} disablePadding>
                      <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
                        <ListItemButton
                          onClick={() => navigate(item.path)}
                          sx={{
                            height: 34,
                            borderRadius: 2,
                            m: '2px 8px',
                            p: '8px 10px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            bgcolor: isActive ? 'rgba(37,99,235,0.09)' : 'transparent',
                            color: isActive ? '#2563EB' : '#6B7280',
                            borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: isActive ? 'rgba(37,99,235,0.09)' : 'rgba(0,0,0,0.04)',
                              color: isActive ? '#2563EB' : '#1A1D23',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: collapsed ? 0 : 28,
                              color: 'inherit',
                              justifyContent: 'center',
                              '& svg': { fontSize: 18 },
                            }}
                          >
                            {item.icon}
                          </ListItemIcon>

                          <AnimatePresence>
                            {!collapsed && (
                              <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}
                              >
                                <ListItemText
                                  primary={item.label}
                                  primaryTypographyProps={{
                                    sx: {
                                      fontSize: '13px',
                                      fontWeight: isActive ? 600 : 500,
                                      color: 'inherit',
                                    }
                                  }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!collapsed && item.badge && (
                            <Chip
                              label={item.badge}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '10px',
                                fontWeight: 600,
                                bgcolor: 'rgba(37,99,235,0.10)',
                                color: '#2563EB',
                                borderRadius: 1.5,
                              }}
                            />
                          )}
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>

        {/* COLLAPSE TOGGLE FOOTER */}
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <IconButton
            onClick={onToggle}
            sx={{
              color: '#6E6E73',
              borderRadius: 1.5,
              p: 0.5,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#1D1D1F' },
            }}
          >
            {collapsed ? <ExpandIcon sx={{ fontSize: 18 }} /> : <CollapseIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
}
