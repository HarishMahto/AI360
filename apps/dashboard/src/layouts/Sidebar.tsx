import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
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
  History,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 62;

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
    sectionTitle: 'Dashboard Views',
    items: [
      { label: 'Overview',              icon: <DashboardIcon />, path: '/dashboard/employee' },
      { label: 'AI Chat Workspace',     icon: <ChatIcon />,      path: '/dashboard/employee?tab=chat' },
      { label: 'Prompt Coach',          icon: <AIIcon />,        path: '/dashboard/employee?tab=prompt-coach' },
      { label: 'Model Recommendations', icon: <RecommendIcon />, path: '/dashboard/employee?tab=model-recs' },
      { label: 'Marketplace',           icon: <StarIcon />,      path: '/dashboard/employee?tab=marketplace', badge: 'Popular' },
      { label: 'Learning Coach',        icon: <SchoolIcon />,    path: '/dashboard/employee?tab=learning-coach' },
      { label: 'Privacy Guard',         icon: <SecurityIcon />,  path: '/dashboard/employee?tab=privacy-guard' },
      { label: 'Prompt History',        icon: <History />,       path: '/dashboard/employee?tab=prompt-history' },
    ],
  },
  {
    sectionTitle: 'Intelligence',
    items: [
      { label: 'Full Analytics', icon: <AnalyticsIcon />, path: '/dashboard/employee/analytics' },
    ],
  },
];

const managerGroups: NavGroup[] = [
  {
    sectionTitle: 'Team Dashboard',
    items: [
      { label: 'Overview',             icon: <DashboardIcon />,   path: '/dashboard/manager' },
      { label: 'Department Analytics', icon: <AnalyticsIcon />,   path: '/dashboard/manager?tab=analytics' },
      { label: 'Leaderboard',          icon: <LeaderboardIcon />, path: '/dashboard/manager?tab=leaderboard' },
      { label: 'Prompt Categories',    icon: <CategoryIcon />,    path: '/dashboard/manager?tab=prompt-categories' },
      { label: 'License Detection',    icon: <LicenseIcon />,     path: '/dashboard/manager?tab=license-detection' },
      { label: 'Benchmarks',           icon: <SpeedIcon />,       path: '/dashboard/manager?tab=benchmarks' },
    ],
  },
  {
    sectionTitle: 'Management',
    items: [
      { label: 'AI FinOps',       icon: <FinOpsIcon />,   path: '/dashboard/manager/finops' },
      { label: 'Usage Forecast',  icon: <ForecastIcon />, path: '/dashboard/manager/forecast' },
      { label: 'Reports',         icon: <ReportIcon />,   path: '/dashboard/manager/reports' },
      { label: 'Recommendations', icon: <RecommendIcon />,path: '/dashboard/manager/recommendations' },
    ],
  },
];

const executiveGroups: NavGroup[] = [
  {
    sectionTitle: 'Executive Views',
    items: [
      { label: 'Overview',            icon: <DashboardIcon />, path: '/dashboard/executive' },
      { label: 'ROI & Spend',         icon: <FinOpsIcon />,    path: '/dashboard/executive?tab=roi-spend' },
      { label: 'Department Rankings', icon: <AnalyticsIcon />, path: '/dashboard/executive?tab=rankings' },
      { label: 'Budget Forecast',     icon: <ForecastIcon />,  path: '/dashboard/executive?tab=forecast' },
      { label: 'Recommendations',     icon: <RecommendIcon />, path: '/dashboard/executive?tab=recommendations' },
      { label: 'Maturity Score',      icon: <MaturityIcon />,  path: '/dashboard/executive?tab=maturity-score' },
    ],
  },
  {
    sectionTitle: 'Management',
    items: [
      { label: 'AI ROI Attribution', icon: <ForecastIcon />,  path: '/dashboard/executive/roi' },
      { label: 'Dept Rankings',      icon: <AnalyticsIcon />, path: '/dashboard/executive/departments' },
      { label: 'Budget Forecast',    icon: <ForecastIcon />,  path: '/dashboard/executive/forecast' },
      { label: 'Executive Reports',  icon: <ReportIcon />,    path: '/dashboard/executive/reports' },
    ],
  },
];

const adminGroups: NavGroup[] = [
  {
    sectionTitle: 'Navigation',
    items: [
      { label: 'Admin Hub',     icon: <DashboardIcon />, path: '/dashboard/admin' },
      { label: 'Organizations', icon: <OrgIcon />,       path: '/dashboard/admin/organizations' },
      { label: 'Users & RBAC', icon: <PeopleIcon />,    path: '/dashboard/admin/users' },
    ],
  },
  {
    sectionTitle: 'System',
    items: [
      { label: 'AI Providers',     icon: <AIIcon />,       path: '/dashboard/admin/providers' },
      { label: 'Budgets & FinOps', icon: <FinOpsIcon />,   path: '/dashboard/admin/budgets' },
      { label: 'System Settings',  icon: <SettingsIcon />, path: '/dashboard/admin/settings' },
    ],
  },
];

const navGroupsByRole: Record<string, NavGroup[]> = {
  EMPLOYEE:  employeeGroups,
  MANAGER:   managerGroups,
  ADMIN:     adminGroups,
  EXECUTIVE: executiveGroups,
};

interface SidebarProps {
  role: string;
  collapsed: boolean;
  onToggle: () => void;
}

// Soft animated pastel orb for light background
function SoftOrb({ top, left, size, color, duration, delay }: {
  top: string; left: string; size: number; color: string; duration: number; delay: number;
}) {
  return (
    <Box
      component={motion.div}
      animate={{
        y:     [0, -20, 10, 0],
        x:     [0, 12, -8, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      sx={{
        position: 'absolute',
        top, left,
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        filter: 'blur(52px)',
        opacity: 0.45,
        pointerEvents: 'none',
      }}
    />
  );
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
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        '& .MuiDrawer-paper': {
          width,
          height: '100vh',
          margin: 0, top: 0, left: 0,
          borderRadius: 0,
          overflowX: 'hidden',
          overflowY: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          color: '#111827',
          position: 'relative',
          zIndex: 100,
        },
      }}
    >
      {/* ── Subtle Animated Background Orbs ── */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {/* Very soft pastel orbs that complement the blue accent */}
        <SoftOrb top="-8%"  left="10%"  size={220} color="radial-gradient(circle, rgba(31,90,166,0.08), transparent)"  duration={16} delay={0} />
        <SoftOrb top="35%"  left="-20%" size={200} color="radial-gradient(circle, rgba(99,102,241,0.07), transparent)" duration={20} delay={3} />
        <SoftOrb top="65%"  left="30%"  size={180} color="radial-gradient(circle, rgba(2,132,199,0.07), transparent)"  duration={14} delay={6} />
        <SoftOrb top="88%"  left="-10%" size={160} color="radial-gradient(circle, rgba(31,90,166,0.06), transparent)"  duration={18} delay={2} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', zIndex: 1 }}>

        {/* ── Brand Header ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            height: 70,
            px: collapsed ? 0 : 2.25,
            borderBottom: '1px solid #F3F4F6',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Logo */}
            <Box
              sx={{
                width: 36, height: 36,
                borderRadius: '10px',
                bgcolor: '#F8F9FA',
                border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(31,90,166,0.1)',
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="AI360 Logo"
                sx={{ width: 48, height: 48, borderRadius: '6px', objectFit: 'cover' }}
              />
            </Box>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    AI360
                  </Typography>
                  <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.1em', textTransform: 'uppercase', mt: 0.2 }}>
                    Enterprise
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>

        {/* ── Navigation ── */}
        <Box sx={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 0.5,
          '&::-webkit-scrollbar': { width: 3 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 2 },
        }}>
          {groups.map((group, gIdx) => (
            <Box key={gIdx} sx={{ mb: 0.25 }}>
              {/* Section label */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Box
                      sx={{
                        mt: gIdx === 0 ? 1.5 : 2.5,
                        mb: 1,
                        px: 1.75,
                        pt: gIdx === 0 ? 0 : 2,
                        borderTop: gIdx === 0 ? 'none' : '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#374151',
                        }}
                      >
                        {group.sectionTitle}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
              {collapsed && gIdx !== 0 && <Box sx={{ height: 16, borderTop: '1px solid #E5E7EB', my: 1 }} />}
              {collapsed && gIdx === 0 && <Box sx={{ height: 6 }} />}

              <List disablePadding>
                {group.items.map((item) => {
                  const currentFullPath = location.pathname + location.search;
                  const isActive = item.path.includes('?')
                    ? currentFullPath === item.path
                    : (location.pathname === item.path && (!location.search || location.search === '?tab=overview'));

                  return (
                    <ListItem
                      key={`${item.label}-${item.path}`}
                      disablePadding
                      sx={{ px: 1, mb: '1px' }}
                    >
                      <Tooltip
                        title={collapsed ? item.label : ''}
                        placement="right"
                        arrow
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: '#1F2937',
                              color: '#F9FAFB',
                              fontSize: '0.76rem',
                              borderRadius: '7px',
                              px: 1.25, py: 0.6,
                            }
                          },
                          arrow: { sx: { color: '#1F2937' } },
                        }}
                      >
                        <ListItemButton
                          onClick={() => navigate(item.path)}
                          sx={{
                            height: 36,
                            borderRadius: '8px',
                            px: collapsed ? 0 : 1.25,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            position: 'relative',
                            overflow: 'visible',
                            transition: 'all 0.16s ease',
                            bgcolor: isActive ? 'rgba(31,90,166,0.09)' : 'transparent',
                            color: isActive ? '#1F5AA6' : '#374151',
                            '&:hover': {
                              bgcolor: isActive ? 'rgba(31,90,166,0.12)' : '#F5F6F7',
                              color: isActive ? '#1F5AA6' : '#111827',
                            },
                          }}
                        >


                          <ListItemIcon
                            sx={{
                              minWidth: collapsed ? 0 : 28,
                              color: 'inherit',
                              justifyContent: 'center',
                              '& svg': {
                                fontSize: 17,
                                opacity: isActive ? 1 : 0.75,
                              },
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
                                transition={{ duration: 0.18 }}
                                style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}
                              >
                                <ListItemText
                                  primary={item.label}
                                  primaryTypographyProps={{
                                    sx: {
                                      fontSize: '13px',
                                      fontWeight: isActive ? 700 : 500,
                                      color: 'inherit',
                                      letterSpacing: '-0.01em',
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
                                height: 16,
                                fontSize: '9px',
                                fontWeight: 700,
                                bgcolor: 'rgba(31,90,166,0.08)',
                                color: '#1F5AA6',
                                borderRadius: '5px',
                                border: 'none',
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

        {/* ── Collapse Toggle ── */}
        <Box
          sx={{
            px: 1, py: 1.25,
            borderTop: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
          }}
        >
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{
              color: '#9CA3AF',
              borderRadius: '7px',
              width: 28, height: 28,
              bgcolor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              transition: 'all 0.16s ease',
              '&:hover': {
                bgcolor: 'rgba(31,90,166,0.06)',
                color: '#1F5AA6',
                borderColor: 'rgba(31,90,166,0.2)',
              },
            }}
          >
            {collapsed
              ? <ExpandIcon sx={{ fontSize: 15 }} />
              : <CollapseIcon sx={{ fontSize: 15 }} />
            }
          </IconButton>
        </Box>

      </Box>
    </Drawer>
  );
}
