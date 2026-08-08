import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Grid, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Divider, Stack,
  Button, LinearProgress, CircularProgress, Card, CardContent, Snackbar, Alert
} from '@mui/material';

const TAB_NAME_MAP: Record<string, number> = {
  overview: 0,
  analytics: 1,
  leaderboard: 2,
  'prompt-categories': 3,
  'license-detection': 4,
  benchmarks: 5,
};
import { TrendingUp, Speed, AttachMoney, ShowChart, Groups, SwapHoriz } from '@mui/icons-material';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import {
  useManagerDashboard, useCostAdvisor, useTeamBenchmarks, useSmartSuggestions,
  useUnusedLicenses, useReallocateLicense, useReallocateAllInactiveLicenses,
} from '../../api/hooks';

const MOCK_DATA = {
  today_spend_usd: 1245.50,
  month_spend_usd: 18450.20,
  projected_spend_usd: 24500.00,
  team_adoption_score: 92,
  adoption_percentage: 88,
  team_efficiency_score: 87,
  department_roi_pct: 380,
  unused_licenses_count: 14,
  unused_licenses_cost_savings: 420,
  department_cost_breakdown: [
    { name: 'Engineering', spend: 8500, users: 45, roi: 420 },
    { name: 'Marketing', spend: 3200, users: 18, roi: 350 },
    { name: 'Sales', spend: 2100, users: 12, roi: 310 },
    { name: 'Design', spend: 1800, users: 8, roi: 290 },
    { name: 'HR', spend: 950, users: 5, roi: 240 }
  ],
  category_breakdown: [
    { name: 'Code Generation', value: 45, color: '#0066CC' },
    { name: 'Data Analysis', value: 25, color: '#34C759' },
    { name: 'Copywriting', value: 15, color: '#FF9500' },
    { name: 'Research', value: 15, color: '#AEAEB2' }
  ],
  top_employees: [
    { rank: 1, name: 'Sarah Jenkins', role: 'Lead Engineer', requests: 1205, cost: 450.2, score: 96, efficiency: '98%' },
    { rank: 2, name: 'Marcus Chen', role: 'Data Scientist', requests: 980, cost: 380.5, score: 92, efficiency: '95%' },
    { rank: 3, name: 'Elena Rodriguez', role: 'Product Manager', requests: 640, cost: 210.0, score: 89, efficiency: '91%' },
    { rank: 4, name: 'David Kim', role: 'Frontend Dev', requests: 890, cost: 290.8, score: 88, efficiency: '90%' },
    { rank: 5, name: 'Anita Patel', role: 'UX Designer', requests: 420, cost: 150.3, score: 85, efficiency: '88%' }
  ],
  top_prompt_templates: [
    { title: 'SAP Prompt', uses: 520, hoursSaved: 1100, efficiency: '98%', author: 'DevOps Team', rating: 5.0 },
    { title: 'Spring Boot Architecture Spec', uses: 340, hoursSaved: 780, efficiency: '95%', author: 'Architecture Guild', rating: 4.9 },
    { title: 'SQL Query Optimizer', uses: 290, hoursSaved: 510, efficiency: '94%', author: 'Data Team', rating: 4.8 }
  ],
  token_trend_data: [
    { name: 'Mon', spend: 400, tokens: 120000 },
    { name: 'Tue', spend: 300, tokens: 98000 },
    { name: 'Wed', spend: 520, tokens: 180000 },
    { name: 'Thu', spend: 278, tokens: 89000 },
    { name: 'Fri', spend: 450, tokens: 150000 },
    { name: 'Sat', spend: 120, tokens: 45000 },
    { name: 'Sun', spend: 95, tokens: 32000 }
  ]
};

const FALLBACK_UNUSED_LICENSES = [
  { id: '1', name: 'John Doe', email: 'john.doe@company.com', department: 'Marketing', last_active: '34 days ago', seat_cost_usd: 30, status: 'unused' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Sales', last_active: '42 days ago', seat_cost_usd: 30, status: 'unused' },
  { id: '3', name: 'Robert Johnson', email: 'robert.j@company.com', department: 'HR', last_active: '60 days ago', seat_cost_usd: 30, status: 'unused' },
];

export default function ManagerDashboard() {
  const { data: serverData, isLoading } = useManagerDashboard();
  const { data: costAdvisorData } = useCostAdvisor();
  const { data: benchmarksData } = useTeamBenchmarks();
  const smartSuggestions = useSmartSuggestions('Engineering').data!;
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabKey = searchParams.get('tab') || 'overview';
  const activeTab = TAB_NAME_MAP[currentTabKey] ?? 0;

  // License detection
  const { data: unusedLicensesData, isLoading: licensesLoading } = useUnusedLicenses();
  const reallocateLicenseMutation = useReallocateLicense();
  const reallocateAllMutation = useReallocateAllInactiveLicenses();
  const [reallocatingId, setReallocatingId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: '#0066CC' }} />
      </Box>
    );
  }

  const stats = { ...MOCK_DATA, ...(serverData || {}) };
  const costAdvisor: any = costAdvisorData || {};
  const teamBenchmarks: any[] = Array.isArray(benchmarksData) ? benchmarksData : [];

  return (
    <Box className="page-enter" sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%', bgcolor: '#F0F5F3', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* HEADER (Square workspace container) */}
      <Box sx={{ background: '#FFFFFF', borderRadius: '22px', p: 3, mb: 3, border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
            <Typography variant="h4" sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
              Manager Control Center
            </Typography>
            <Chip label="Department Leaderboard #1" size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: '#F5F4FB', color: '#5B57F0' }} />
          </Stack>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#85839A', mt: 0.5 }}>
            Department analytics, license detection, ROI tracking & prompt intelligence.
          </Typography>
        </Box>

        <Chip
          label={`${stats.unused_licenses_count} Unused Licenses ($${stats.unused_licenses_cost_savings}/mo waste)`}
          onClick={() => setSearchParams({ tab: 'license-detection' })}
          sx={{ bgcolor: '#FCF0DE', color: '#E8A23D', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8125rem', px: 1, py: 2.5, borderRadius: '12px', cursor: 'pointer', '&:hover': { bgcolor: '#FDF7EC' } }}
        />
      </Box>

      {/* COST ADVISOR NUDGE (Square workspace box) */}
      <Box sx={{ mb: 4, p: 3, borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5B57F0' }}>
                Daily Proactive Cost Advisor
              </Typography>
              <Chip label="Morning Snapshot" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, borderRadius: 1, bgcolor: '#F5F4FB', color: '#5B57F0' }} />
            </Stack>
            <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>
              {costAdvisor.recommendation || "Move summarization tasks to Gemini Flash."}
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Box>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#85839A' }}>Period</Typography>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.9rem', fontWeight: 500, color: '#201F2E' }}>{costAdvisor.period || "Yesterday"}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#85839A' }}>Dept</Typography>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.9rem', fontWeight: 500, color: '#201F2E' }}>{costAdvisor.department || "Engineering"}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#85839A' }}>Spent</Typography>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.9rem', fontWeight: 600, color: '#E53E3E' }}>{costAdvisor.spent_formatted || "₹820"}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#85839A' }}>Potential Saving</Typography>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.9rem', fontWeight: 600, color: '#1FAE7A' }}>{costAdvisor.potential_saving_formatted || "₹210"}</Typography>
            </Box>
            <Button variant="contained" size="small" disableElevation sx={{ bgcolor: '#E6E6FA', color: '#111827', fontFamily: 'Inter, sans-serif', borderRadius: '8px', textTransform: 'none', fontWeight: 500 }}>
              Apply Suggestion
            </Button>
          </Stack>
        </Stack>
      </Box>



      {/* TAB 0: OVERVIEW */}
      {activeTab === 0 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
          {/* KPI GRID */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 4, width: '100%' }}>
            <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                    Adoption Score
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                    <TrendingUp fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>{stats.team_adoption_score}/100</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#1FAE7A', mt: 0.5 }}>{stats.adoption_percentage}% Active</Typography>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                    Efficiency Score
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#E3F7EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1FAE7A' }}>
                    <Speed fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>{stats.team_efficiency_score}/100</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>+5% vs last month</Typography>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                    Department ROI
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FCF0DE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8A23D' }}>
                    <AttachMoney fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#1FAE7A' }}>{stats.department_roi_pct}%</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>4.8x return</Typography>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                    Forecast
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                    <ShowChart fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>${(stats.projected_spend_usd / 1000).toFixed(1)}k</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>+15% growth</Typography>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                    Unused Seats
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                    <Groups fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#FF3B30' }}>{stats.unused_licenses_count}</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#FF3B30', mt: 0.5 }}>${stats.unused_licenses_cost_savings}/mo waste</Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 2, width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Box mb={2}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>Token Trends & Consumption</Typography>
              </Box>
              <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ height: 320, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.token_trend_data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="mgrSpendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0066CC" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                        <Area yAxisId="left" type="monotone" dataKey="spend" stroke="#0066CC" strokeWidth={2} fillOpacity={1} fill="url(#mgrSpendGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ width: '100%' }}>
              <Box mb={2}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>Department Cost Breakdown</Typography>
              </Box>
              <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ height: 320, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.department_cost_breakdown} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#EAEAEA" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 12, fill: '#1D1D1F', fontWeight: 500 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                        <Bar dataKey="spend" radius={[0, 4, 4, 0]} barSize={20}>
                          {stats.department_cost_breakdown.map((_, i) => (
                            <Cell key={i} fill={['#0066CC', '#34C759', '#FF9500', '#5856D6', '#FF2D55'][i % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      {/* TAB 1: DEPT ANALYTICS */}
      {activeTab === 1 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
          <TableContainer sx={{ minHeight: 400, borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Department</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Active Users</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Monthly Spend</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Adoption</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>ROI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.department_cost_breakdown.map((dept) => (
                  <TableRow key={dept.name} sx={{ '&:hover': { bgcolor: '#F5F4FB' }, '&:last-child td': { border: 0 }, height: 56 }}>
                    <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#201F2E', fontWeight: 600 }}>{dept.name}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#85839A' }}>{dept.users}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#201F2E', fontWeight: 600 }}>${dept.spend.toLocaleString()}</TableCell>
                    <TableCell align="center" sx={{ px: 3, borderBottom: '1px solid #E9E7F5' }}>
                      <Chip label="92% Active" size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#F5F4FB', color: '#5B57F0' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#1FAE7A', fontWeight: 600 }}>{dept.roi}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 2: LEADERBOARD */}
      {activeTab === 2 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
          <TableContainer sx={{ minHeight: 400, borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Employee</TableCell>
                  <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Role</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Requests</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Cost</TableCell>
                  <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Score</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Efficiency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.top_employees.map((emp) => (
                  <TableRow key={emp.rank} sx={{ '&:hover': { bgcolor: '#F5F4FB' }, '&:last-child td': { border: 0 }, height: 56 }}>
                    <TableCell sx={{ px: 3, borderBottom: '1px solid #E9E7F5' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.125rem', fontWeight: 600, color: '#C0BFE0', width: 20 }}>{emp.rank}</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#201F2E', fontWeight: 600 }}>{emp.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#85839A' }}>{emp.role}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#85839A' }}>{emp.requests}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#85839A' }}>${emp.cost}</TableCell>
                    <TableCell align="center" sx={{ px: 3, borderBottom: '1px solid #E9E7F5' }}>
                      <Chip label={`${emp.score}/100`} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#E3F7EE', color: '#1FAE7A' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#5B57F0', fontWeight: 600 }}>{emp.efficiency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 3: PROMPT CATEGORIES */}
      {activeTab === 3 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 2, width: '100%' }}>
              <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, width: '100%' }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>Top Department Prompt Templates</Typography>
                <TableContainer sx={{ width: '100%' }}>
                  <Table sx={{ width: '100%' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#85839A' }}>Template Title</TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#85839A' }}>Uses</TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#85839A' }}>Saved</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#85839A' }}>Author</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.top_prompt_templates.map((tpl, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#F5F4FB' } }}>
                          <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 500, color: '#201F2E' }}>{tpl.title}</TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#85839A' }}>{tpl.uses}</TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#1FAE7A', fontWeight: 600 }}>{tpl.hoursSaved}h</TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A' }}>{tpl.author}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            <Box sx={{ width: '100%' }}>
              <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, height: '100%', width: '100%' }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>Category Distribution</Typography>
                <Stack spacing={2}>
                  {stats.category_breakdown.map((cat, i) => (
                    <Box key={i}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>{cat.name}</Typography>
                        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: cat.color }}>{cat.value}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={cat.value} sx={{ height: 6, borderRadius: 3, bgcolor: '#F5F4FB', '& .MuiLinearProgress-bar': { bgcolor: cat.color } }} />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      {/* TAB 4: LICENSE DETECTION */}
      {activeTab === 4 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
          <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>Unused License Detection</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A' }}>Seats inactive for 30+ days costing ${stats.unused_licenses_cost_savings}/month</Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                disabled={reallocateAllMutation.isPending}
                sx={{ bgcolor: '#FF3B30', fontFamily: 'Inter, sans-serif', textTransform: 'none', borderRadius: '8px' }}
                onClick={() => {
                  reallocateAllMutation.mutate(undefined, {
                    onSuccess: (res: any) => {
                      const count = res?.reallocated_count ?? 0;
                      setSnackbar({ open: true, message: `${count} seat${count === 1 ? '' : 's'} reallocated successfully.`, severity: 'success' });
                    },
                    onError: () => setSnackbar({ open: true, message: 'Could not reallocate seats — please try again.', severity: 'error' }),
                  });
                }}
              >
                {reallocateAllMutation.isPending ? <CircularProgress size={16} sx={{ mr: 1, color: '#fff' }} /> : null}Reallocate All Inactive Seats
              </Button>
            </Box>
            <TableContainer sx={{ width: '100%' }}>
              <Table sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                    <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>User Name</TableCell>
                    <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Email</TableCell>
                    <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Department</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Last Active</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Seat Cost</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licensesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, borderBottom: '1px solid #E9E7F5' }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : (((unusedLicensesData as any[]) || FALLBACK_UNUSED_LICENSES).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#85839A', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', borderBottom: '1px solid #E9E7F5' }}>
                        No unused licenses detected. Nice work keeping seats utilized.
                      </TableCell>
                    </TableRow>
                  ) : ((unusedLicensesData as any[]) || FALLBACK_UNUSED_LICENSES).map((lic: any) => (
                    <TableRow key={lic.id} sx={{ '&:hover': { bgcolor: '#F5F4FB' } }}>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E', px: 3, borderBottom: '1px solid #E9E7F5' }}>{lic.name}</TableCell>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', px: 3, borderBottom: '1px solid #E9E7F5' }}>{lic.email}</TableCell>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', px: 3, borderBottom: '1px solid #E9E7F5' }}>{lic.department}</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#E53E3E', fontWeight: 600, px: 3, borderBottom: '1px solid #E9E7F5' }}>{lic.last_active}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E', px: 3, borderBottom: '1px solid #E9E7F5' }}>${lic.seat_cost_usd}/mo</TableCell>
                      <TableCell align="right" sx={{ px: 3, borderBottom: '1px solid #E9E7F5' }}>
                        <Chip
                          label={lic.status === 'reallocated' ? 'Reallocated' : 'Unused'}
                          size="small"
                          sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: lic.status === 'reallocated' ? '#E3F7EE' : '#FDF7EC', color: lic.status === 'reallocated' ? '#1FAE7A' : '#E8A23D' }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ px: 3, borderBottom: '1px solid #E9E7F5' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={reallocatingId === lic.id && reallocateLicenseMutation.isPending ? <CircularProgress size={14} /> : <SwapHoriz fontSize="small" />}
                          disabled={lic.status === 'reallocated' || (reallocateLicenseMutation.isPending && reallocatingId === lic.id)}
                          sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', borderColor: '#E9E7F5', color: '#5B57F0' }}
                          onClick={() => {
                            setReallocatingId(lic.id);
                            reallocateLicenseMutation.mutate(lic.id, {
                              onSuccess: () => setSnackbar({ open: true, message: `Seat for ${lic.name} reallocated successfully.`, severity: 'success' }),
                              onError: () => setSnackbar({ open: true, message: `Could not reallocate seat for ${lic.name}.`, severity: 'error' }),
                              onSettled: () => setReallocatingId(null),
                            });
                          }}
                        >
                          Reallocate
                        </Button>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* TAB 5: BENCHMARKS */}
      {activeTab === 5 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, width: '100%' }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>Department Velocity Benchmarks</Typography>
                <Stack spacing={2.5}>
                  {[
                    { label: 'Engineering Adoption', val: 92, target: '90%' },
                    { label: 'Prompt Quality Score', val: 87, target: '85%' },
                    { label: 'Token Efficiency Ratio', val: 95, target: '90%' },
                    { label: 'Cost Optimization Score', val: 88, target: '80%' }
                  ].map((b, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>{b.label}</Typography>
                        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#5B57F0' }}>{b.val}% (Target: {b.target})</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={b.val} sx={{ height: 6, borderRadius: 3, bgcolor: '#F5F4FB', '& .MuiLinearProgress-bar': { bgcolor: '#5B57F0' } }} />
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>Industry Peer Comparisons</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#85839A' }}>Metric</TableCell>
                        <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#85839A' }}>Your Team</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#85839A' }}>Peer Avg</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { metric: 'Avg ROI', team: '380%', peer: '240%' },
                        { metric: 'Time Saved/Dev', team: '4.2 hrs/wk', peer: '2.8 hrs/wk' },
                        { metric: 'Active Adoption', team: '88%', peer: '64%' }
                      ].map((m, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#F5F4FB' }, '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#201F2E', fontWeight: 600, borderBottom: '1px solid #E9E7F5' }}>{m.metric}</TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#1FAE7A', fontWeight: 600, borderBottom: '1px solid #E9E7F5' }}>{m.team}</TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#85839A', borderBottom: '1px solid #E9E7F5' }}>{m.peer}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
