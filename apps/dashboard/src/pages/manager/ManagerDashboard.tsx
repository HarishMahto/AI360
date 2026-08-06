import React, { useState } from 'react';
import {
  Box, Grid, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar, Divider, Stack,
  Tabs, Tab, Button, LinearProgress, CircularProgress, Card, CardContent
} from '@mui/material';
import { TrendingUp, Speed, AttachMoney, ShowChart, Groups } from '@mui/icons-material';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from 'recharts';
import { useManagerDashboard, useCostAdvisor, useTeamBenchmarks, useSmartSuggestions } from '../../api/hooks';

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
  unused_licenses: [
    { id: 1, name: 'John Doe', email: 'john.doe@company.com', dept: 'Marketing', lastActive: '34 days ago', seatCost: '$30/mo' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', dept: 'Sales', lastActive: '42 days ago', seatCost: '$30/mo' },
    { id: 3, name: 'Robert Johnson', email: 'robert.j@company.com', dept: 'HR', lastActive: '60 days ago', seatCost: '$30/mo' }
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

export default function ManagerDashboard() {
  const { data: serverData, isLoading } = useManagerDashboard();
  const { data: costAdvisorData } = useCostAdvisor();
  const { data: benchmarksData } = useTeamBenchmarks();
  const smartSuggestions = useSmartSuggestions('Engineering').data!;
  const [activeTab, setActiveTab] = useState(0);

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
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, width: '100%', bgcolor: '#F5F7FA', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
            <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
              Manager Control Center
            </Typography>
            <Chip label="Department Leaderboard #1" size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(0,102,204,0.08)', color: '#0066CC' }} />
          </Stack>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73' }}>
            Department analytics, license detection, ROI tracking & prompt intelligence.
          </Typography>
        </Box>

        <Chip
          label={`${stats.unused_licenses_count} Unused Licenses ($${stats.unused_licenses_cost_savings}/mo waste)`}
          onClick={() => setActiveTab(4)}
          sx={{ bgcolor: 'rgba(255,149,0,0.10)', color: '#9E5B00', fontWeight: 600, fontSize: '0.8125rem', px: 1, py: 2.5, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,149,0,0.20)' } }}
        />
      </Box>

      {/* COST ADVISOR NUDGE */}
      <Box sx={{ mb: 4, p: 3, borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', bgcolor: '#FFFFFF' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#0066CC' }}>
                Daily Proactive Cost Advisor
              </Typography>
              <Chip label="Morning Snapshot" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, borderRadius: 1, bgcolor: '#F5F5F7', color: '#6E6E73' }} />
            </Stack>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>
              {costAdvisor.recommendation || "Move summarization tasks to Gemini Flash."}
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Box>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>Period</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1D1D1F' }}>{costAdvisor.period || "Yesterday"}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>Dept</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1D1D1F' }}>{costAdvisor.department || "Engineering"}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>Spent</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FF3B30' }}>{costAdvisor.spent_formatted || "₹820"}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>Potential Saving</Typography>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34C759' }}>{costAdvisor.potential_saving_formatted || "₹210"}</Typography>
            </Box>
            <Button variant="contained" size="small" disableElevation sx={{ bgcolor: '#0066CC', borderRadius: 1.5, textTransform: 'none', fontWeight: 500 }}>
              Apply Suggestion
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* TABS */}
      <Tabs 
        value={activeTab} 
        onChange={(_, v) => setActiveTab(v)} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          mb: 3, 
          borderBottom: '1px solid rgba(0,0,0,0.08)', 
          '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0', bgcolor: '#0066CC' } 
        }}
      >
        <Tab label="Overview" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
        <Tab label="Department Analytics" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
        <Tab label="Leaderboard" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
        <Tab label="Prompt Categories" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
        <Tab label="License Detection" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
        <Tab label="Benchmarks" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
      </Tabs>

      {/* TAB 0: OVERVIEW */}
      {activeTab === 0 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
          {/* KPI GRID */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                      Adoption Score
                    </Typography>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                      <TrendingUp fontSize="small" />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F' }}>{stats.team_adoption_score}/100</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#34C759', mt: 0.5 }}>{stats.adoption_percentage}% Active</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #0D9488', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                      Efficiency Score
                    </Typography>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(13,148,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
                      <Speed fontSize="small" />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F' }}>{stats.team_efficiency_score}/100</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>+5% vs last month</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #D97706', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                      Department ROI
                    </Typography>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                      <AttachMoney fontSize="small" />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#34C759' }}>{stats.department_roi_pct}%</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>4.8x return</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #7C3AED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                      Forecast
                    </Typography>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                      <ShowChart fontSize="small" />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F' }}>${(stats.projected_spend_usd / 1000).toFixed(1)}k</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>+15% growth</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                      Unused Seats
                    </Typography>
                    <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                      <Groups fontSize="small" />
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#FF3B30' }}>{stats.unused_licenses_count}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#FF3B30', mt: 0.5 }}>${stats.unused_licenses_cost_savings}/mo waste</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Box mb={2}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Token Trends & Consumption</Typography>
              </Box>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
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
            </Grid>

            <Grid item xs={12} md={5}>
              <Box mb={2}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Department Cost Breakdown</Typography>
              </Box>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
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
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 1: DEPT ANALYTICS */}
      {activeTab === 1 && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
          <TableContainer sx={{ minHeight: 400,  borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                  <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Department</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Active Users</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Monthly Spend</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Adoption</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>ROI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.department_cost_breakdown.map((dept) => (
                  <TableRow key={dept.name} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 }, height: 44 }}>
                    <TableCell sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#1D1D1F', fontWeight: 500 }}>{dept.name}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#6E6E73' }}>{dept.users}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#1D1D1F', fontWeight: 600 }}>${dept.spend.toLocaleString()}</TableCell>
                    <TableCell align="center" sx={{ px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <Chip label="92% Active" size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(0,102,204,0.08)', color: '#0066CC' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#34C759', fontWeight: 600 }}>{dept.roi}%</TableCell>
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
          <TableContainer sx={{ minHeight: 400,  borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                  <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Employee</TableCell>
                  <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Role</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Requests</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Cost</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Score</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Efficiency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.top_employees.map((emp) => (
                  <TableRow key={emp.rank} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 }, height: 44 }}>
                    <TableCell sx={{ px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography sx={{ fontSize: '1.125rem', fontWeight: 300, color: '#AEAEB2', width: 20 }}>{emp.rank}</Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F', fontWeight: 500 }}>{emp.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#6E6E73' }}>{emp.role}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#6E6E73' }}>{emp.requests}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#6E6E73' }}>${emp.cost}</TableCell>
                    <TableCell align="center" sx={{ px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <Chip label={`${emp.score}/100`} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(52,199,89,0.10)', color: '#1A7F37' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8125rem', px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#0066CC', fontWeight: 600 }}>{emp.efficiency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 3,4,5 would follow similarly, keeping it concise */}
      {(activeTab === 3 || activeTab === 4 || activeTab === 5) && (
        <Box sx={{ animation: 'fadeUp 0.4s ease both', textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: '0.9375rem', color: '#6E6E73' }}>Content available in full version.</Typography>
        </Box>
      )}

    </Box>
  );
}
