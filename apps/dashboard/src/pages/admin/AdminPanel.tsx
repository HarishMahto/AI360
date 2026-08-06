import React from 'react';
import { Box, Grid, Typography, Chip, Stack, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Divider, Card, CardContent } from '@mui/material';
import { 
  People as PeopleIcon, 
  Business as OrgIcon, 
  Security as SecurityIcon, 
  Speed as SpeedIcon, 
  MonetizationOn as BudgetIcon, 
  AutoAwesome as AIIcon, 
  CheckCircle, 
  Warning, 
  Error as ErrorIcon, 
  MoreVert as MoreVertIcon 
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardSkeleton } from '../../components/LoadingSkeleton';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';
const SUCCESS_GREEN = '#34C759';
const WARNING_ORANGE = '#FF9500';
const DANGER_RED = '#FF3B30';

const REVENUE_DATA = [
  { name: 'Jan', value: 12000, users: 400 },
  { name: 'Feb', value: 19000, users: 650 },
  { name: 'Mar', value: 15000, users: 500 },
  { name: 'Apr', value: 22000, users: 800 },
  { name: 'May', value: 28000, users: 1100 },
  { name: 'Jun', value: 25000, users: 950 },
  { name: 'Jul', value: 35000, users: 1400 },
];

const SYSTEM_METRICS = [
  { id: 'stat-users', label: 'Total Users', value: '2.4k', icon: <PeopleIcon fontSize="small" />, color: '#2563EB', trend: '+12% this week' },
  { id: 'stat-orgs', label: 'Organizations', value: '48', icon: <OrgIcon fontSize="small" />, color: '#0D9488', trend: '+5% this month' },
  { id: 'stat-sessions', label: 'Active Sessions', value: '892', icon: <SpeedIcon fontSize="small" />, color: '#D97706', trend: 'Peaking right now' },
  { id: 'stat-health', label: 'System Health', value: '99.9%', icon: <SecurityIcon fontSize="small" />, color: '#7C3AED', trend: 'All systems nominal' },
];

const QUICK_ACTIONS = [
  { label: 'Manage Users', icon: <PeopleIcon />, color: ACCENT_BLUE },
  { label: 'Budgets', icon: <BudgetIcon />, color: '#1D1D1F' },
  { label: 'AI Providers', icon: <AIIcon />, color: ACCENT_BLUE },
  { label: 'Security', icon: <SecurityIcon />, color: '#1D1D1F' },
];

const DEMO_ORGS = [
  { name: 'Acme Corp', users: 42, spend: 3200, status: 'active', plan: 'Enterprise' },
  { name: 'TechNova Inc', users: 28, spend: 2100, status: 'active', plan: 'Pro' },
  { name: 'StartupXYZ', users: 12, spend: 540, status: 'trial', plan: 'Trial' },
  { name: 'Global Finance', users: 65, spend: 5400, status: 'active', plan: 'Enterprise' },
];

const AUDIT_LOGS = [
  { type: 'success', msg: 'Budget approved for TechNova Inc', time: '15m ago' },
  { type: 'warning', msg: 'High API usage detected for Acme Corp', time: '1h ago' },
  { type: 'error', msg: 'Failed login attempt (3 tries)', time: '2h ago' },
];

export default function AdminPanel() {
  const { data, isLoading } = useAdminDashboard();
  if (isLoading) return <DashboardSkeleton />;

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', p: 0 }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both', px: 1.5, pt: 1.5 }}>
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
              Admin Hub
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
              Platform governance & intelligent monitoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label="Super Admin" size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(0,102,204,0.08)', color: ACCENT_BLUE }} />
            <Chip label="All Systems Nominal" size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(52,199,89,0.10)', color: '#1A7F37' }} />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2, width: '100%' }}>
          {SYSTEM_METRICS.map((m) => (
            <Card key={m.id} sx={{ width: '100%', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: `3px solid ${m.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${m.color}15`, color: m.color }}>
                  {m.icon}
                </Box>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {m.label}
                </Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                  {m.value}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: m.color, mt: 0.5, fontWeight: 500 }}>
                  {m.trend}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
          <Card sx={{ width: '100%', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Platform Growth</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73' }}>Revenue & Active Users</Typography>
                </Box>
                <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
              </Box>
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={ACCENT_BLUE} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={ACCENT_BLUE} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="value" stroke={ACCENT_BLUE} strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Stack spacing={2} sx={{ width: '100%' }}>
            <Card sx={{ width: '100%', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Quick Actions</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  {QUICK_ACTIONS.map((a) => (
                    <Box key={a.label} sx={{
                      p: 2, borderRadius: 2, cursor: 'pointer',
                      bgcolor: '#FAFAFA',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1,
                      '&:hover': { bgcolor: '#F5F5F7', borderColor: 'rgba(0,0,0,0.08)' }
                    }}>
                      <Box sx={{ color: a.color }}>{a.icon}</Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F' }}>{a.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Recent Activity</Typography>
                <Stack spacing={2.5}>
                  {AUDIT_LOGS.map((log, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ mt: 0.25 }}>
                        {log.type === 'success' ? <CheckCircle sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> : 
                         log.type === 'warning' ? <Warning sx={{ fontSize: 16, color: WARNING_ORANGE }} /> : 
                         <ErrorIcon sx={{ fontSize: 16, color: DANGER_RED }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1D1D1F' }}>{log.msg}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{log.time}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Card sx={{ width: '100%', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Top Organizations</Typography>
                <Chip label="View All" size="small" sx={{ height: 24, fontSize: '0.75rem', bgcolor: 'transparent', border: '1px solid rgba(0,0,0,0.1)' }} />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 3 }}>Organization</TableCell>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25 }}>Users</TableCell>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25 }}>Spend</TableCell>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 3 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DEMO_ORGS.map((org) => (
                      <TableRow key={org.name} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8125rem', fontWeight: 600, bgcolor: 'rgba(0,102,204,0.08)', color: ACCENT_BLUE }}>{org.name[0]}</Avatar>
                            <Box>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>{org.name}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{org.plan}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{org.users}</TableCell>
                        <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>${org.spend.toLocaleString()}</TableCell>
                        <TableCell sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Chip label={org.status} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: org.status === 'active' ? 'rgba(52,199,89,0.10)' : 'rgba(0,0,0,0.04)', color: org.status === 'active' ? '#1A7F37' : '#6E6E73', textTransform: 'capitalize' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
