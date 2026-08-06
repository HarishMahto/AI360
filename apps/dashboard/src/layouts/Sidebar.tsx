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
  EmojiEvents as LeaderboardIcon,
  Category as CategoryIcon,
  VpnKey as LicenseIcon,
  Speed as SpeedIcon,
  School as SchoolIcon,
  Shield as SecurityIcon,
  WorkspacePremium as MaturityIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_EXPANDED = 235;
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
    sectionTitle: 'DASHBOARD VIEWS',
    items: [
      { label: 'Overview', icon: <DashboardIcon />, path: '/dashboard/employee' },
      { label: 'AI Chat Workspace', icon: <ChatIcon />, path: '/dashboard/employee?tab=chat' },
      { label: 'Prompt Coach', icon: <AIIcon />, path: '/dashboard/employee?tab=prompt-coach' },
      { label: 'Model Recommendations', icon: <RecommendIcon />, path: '/dashboard/employee?tab=model-recs' },
      { label: 'Marketplace', icon: <StarIcon />, path: '/dashboard/employee?tab=marketplace', badge: 'Popular' },
      { label: 'Learning Coach', icon: <SchoolIcon />, path: '/dashboard/employee?tab=learning-coach' },
      { label: 'Privacy Guard', icon: <SecurityIcon />, path: '/dashboard/employee?tab=privacy-guard' },
    ],
  },
  {
    sectionTitle: 'INTELLIGENCE & FINOPS',
    items: [
      { label: 'Full Analytics', icon: <AnalyticsIcon />, path: '/dashboard/employee/analytics' },
    ],
  },
];

const managerGroups: NavGroup[] = [
  {
    sectionTitle: 'TEAM DASHBOARD VIEWS',
    items: [
      { label: 'Overview', icon: <DashboardIcon />, path: '/dashboard/manager' },
      { label: 'Department Analytics', icon: <AnalyticsIcon />, path: '/dashboard/manager?tab=analytics' },
      { label: 'Leaderboard', icon: <LeaderboardIcon />, path: '/dashboard/manager?tab=leaderboard' },
      { label: 'Prompt Categories', icon: <CategoryIcon />, path: '/dashboard/manager?tab=prompt-categories' },
      { label: 'License Detection', icon: <LicenseIcon />, path: '/dashboard/manager?tab=license-detection' },
      { label: 'Benchmarks', icon: <SpeedIcon />, path: '/dashboard/manager?tab=benchmarks' },
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
    sectionTitle: 'EXECUTIVE VIEWS',
    items: [
      { label: 'Overview', icon: <DashboardIcon />, path: '/dashboard/executive' },
      { label: 'ROI & Spend', icon: <FinOpsIcon />, path: '/dashboard/executive?tab=roi-spend' },
      { label: 'Department Rankings', icon: <AnalyticsIcon />, path: '/dashboard/executive?tab=rankings' },
      { label: 'Budget Forecast', icon: <ForecastIcon />, path: '/dashboard/executive?tab=forecast' },
      { label: 'Recommendations', icon: <RecommendIcon />, path: '/dashboard/executive?tab=recommendations' },
      { label: 'Maturity Score', icon: <MaturityIcon />, path: '/dashboard/executive?tab=maturity-score' },
    ],
  },
  {
    sectionTitle: 'SYSTEM MANAGEMENT',
    items: [
      { label: 'AI ROI Attribution', icon: <ForecastIcon />, path: '/dashboard/executive/roi' },
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
          background: '#E4EFE9',
          borderRight: '1px solid rgba(43, 108, 93, 0.14)',
          color: '#1A2F29',
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
            height: 70,
            px: collapsed ? 0 : 2.5,
            borderBottom: '1px solid rgba(43, 108, 93, 0.14)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1F5AA6 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 3px 8px rgba(31,90,166,0.3)',
              }}
            >
              <AIIcon sx={{ fontSize: 24 }} />
            </Box>
            {!collapsed && (
              <Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2F29', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  AI360
                </Typography>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#2B6C5D', letterSpacing: '0.08em', textTransform: 'uppercase', mt: 0.25 }}>
                  ENTERPRISE
                </Typography>
              </Box>
            )}
          </Box>
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
                  const currentFullPath = location.pathname + location.search;
                  const isActive = item.path.includes('?')
                    ? currentFullPath === item.path
                    : (location.pathname === item.path && (!location.search || location.search === '?tab=overview'));
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
                            bgcolor: isActive ? 'rgba(44,122,123,0.12)' : 'transparent',
                            color: isActive ? '#2C7A7B' : '#4A655D',
                            borderLeft: isActive ? '3px solid #2C7A7B' : '3px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: isActive ? 'rgba(44,122,123,0.14)' : 'rgba(43,108,93,0.06)',
                              color: isActive ? '#2C7A7B' : '#1A2F29',
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
