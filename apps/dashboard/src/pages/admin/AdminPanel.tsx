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

const ACCENT_BLUE = '#5B57F0';
const SUCCESS_GREEN = '#1FAE7A';
const WARNING_ORANGE = '#E8A23D';
const DANGER_RED = '#E74C3C';

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
  { id: 'stat-users', label: 'Total Users', value: '2.4k', icon: <PeopleIcon fontSize="small" />, color: '#5B57F0', trend: '+12% this week' },
  { id: 'stat-orgs', label: 'Organizations', value: '48', icon: <OrgIcon fontSize="small" />, color: '#1FAE7A', trend: '+5% this month' },
  { id: 'stat-sessions', label: 'Active Sessions', value: '892', icon: <SpeedIcon fontSize="small" />, color: '#E8A23D', trend: 'Peaking right now' },
  { id: 'stat-health', label: 'System Health', value: '99.9%', icon: <SecurityIcon fontSize="small" />, color: '#5B57F0', trend: 'All systems nominal' },
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
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both', px: { xs: 2, md: 4 }, pt: 3, pb: 6 }}>
        
        <Box sx={{ bgcolor: '#FFFFFF', borderRadius: '22px', p: 3, mb: 4, border: '1px solid #E9E7F5', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
          <Box>
            <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', fontWeight: 600, color: '#201F2E' }}>
              Admin Hub
            </Typography>
            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>
              Platform governance & intelligent monitoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label="Super Admin" size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#F5F4FB', color: '#5B57F0' }} />
            <Chip label="All Systems Nominal" size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#E3F7EE', color: '#1FAE7A' }} />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2, width: '100%' }}>
          {SYSTEM_METRICS.map((m) => (
            <Card key={m.id} sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', borderTop: `3px solid ${m.color}`, boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', transition: 'all 0.2s', '&:hover': { boxShadow: '0 8px 32px rgba(32, 31, 46, 0.06)' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 24, right: 24, width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${m.color}15`, color: m.color }}>
                  {m.icon}
                </Box>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {m.label}
                </Typography>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '2rem', fontWeight: 600, color: '#201F2E', mt: 1 }}>
                  {m.value}
                </Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: m.color, mt: 1, fontWeight: 500 }}>
                  {m.trend}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2, mb: 2, width: '100%' }}>
          <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: '100%', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' }}>Platform Growth</Typography>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A' }}>Revenue & Active Users</Typography>
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A' }} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="value" stroke={ACCENT_BLUE} strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Stack spacing={2} sx={{ width: '100%' }}>
            <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>Quick Actions</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  {QUICK_ACTIONS.map((a) => (
                    <Box key={a.label} sx={{
                      p: 2, borderRadius: '12px', cursor: 'pointer',
                      bgcolor: '#FAFAFA',
                      border: '1px solid #E9E7F5',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1,
                      '&:hover': { bgcolor: '#F5F4FB', borderColor: '#5B57F0' }
                    }}>
                      <Box sx={{ color: a.color }}>{a.icon}</Box>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>{a.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>Recent Activity</Typography>
                <Stack spacing={2.5}>
                  {AUDIT_LOGS.map((log, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ mt: 0.25 }}>
                        {log.type === 'success' ? <CheckCircle sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> : 
                         log.type === 'warning' ? <Warning sx={{ fontSize: 16, color: WARNING_ORANGE }} /> : 
                         <ErrorIcon sx={{ fontSize: 16, color: DANGER_RED }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>{log.msg}</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>{log.time}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Box sx={{ width: '100%', mt: 2 }}>
          <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' }}>Top Organizations</Typography>
                <Chip label="View All" size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 24, fontSize: '0.75rem', bgcolor: 'transparent', border: '1px solid #E9E7F5', fontWeight: 600 }} />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5, px: 3 }}>Organization</TableCell>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Users</TableCell>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Spend</TableCell>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5, px: 3 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DEMO_ORGS.map((org) => (
                      <TableRow key={org.name} sx={{ '&:hover': { bgcolor: '#FAFAFA' }, '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ py: 1.5, px: 3, borderBottom: '1px solid #E9E7F5' }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ width: 32, height: 32, fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, bgcolor: '#F5F4FB', color: '#5B57F0' }}>{org.name[0]}</Avatar>
                            <Box>
                              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>{org.name}</Typography>
                              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>{org.plan}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>{org.users}</TableCell>
                        <TableCell sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>${org.spend.toLocaleString()}</TableCell>
                        <TableCell sx={{ py: 1.5, px: 3, borderBottom: '1px solid #E9E7F5' }}>
                          <Chip label={org.status} size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: org.status === 'active' ? '#E3F7EE' : '#FAFAFA', color: org.status === 'active' ? '#1FAE7A' : '#85839A', textTransform: 'capitalize' }} />
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
