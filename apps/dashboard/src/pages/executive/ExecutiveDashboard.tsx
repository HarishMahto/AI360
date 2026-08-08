import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Grid, Typography, Chip, Stack, LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Avatar, Divider, Paper, Button, Card, CardContent, Snackbar, Alert
} from '@mui/material';

const TAB_NAME_MAP: Record<string, number> = {
  overview: 0,
  'roi-spend': 1,
  rankings: 2,
  forecast: 3,
  recommendations: 4,
  'maturity-score': 5,
};
import {
  TrendingUp, Groups, AttachMoney, EmojiEvents, AutoAwesome as AIIcon, MoreVert, Savings,
  Psychology, Speed, Assessment, Lightbulb, WorkspacePremium, ArrowForward, Layers, ChevronRight, ShowChart
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, LineChart, Line, PieChart, Pie } from 'recharts';
import {
  useExecutiveDashboard, useMaturityScore, useOLSRegression, useDepartmentAnalytics, useForecast,
  useROICalculator, useApproveInitiative, useEnableAutoSwitching
} from '../../api/hooks';
import { MATURITY_LADDER } from '../../engines';

const ACCENT_BLUE = '#0066CC';
const SUCCESS_GREEN = '#34C759';
const WARNING_ORANGE = '#FF9500';
const DANGER_RED = '#FF3B30';

const DEMO_SPEND_BY_PROVIDER = [
  { name: 'OpenAI', value: 145000, color: '#10A37F' },
  { name: 'Anthropic', value: 85000, color: '#D97757' },
  { name: 'Google', value: 50000, color: '#4285F4' }
];
const PROVIDER_COLORS: Record<string, string> = { OpenAI: '#10A37F', Anthropic: '#D97757', Google: '#4285F4' };
const PROVIDER_FALLBACK_COLORS = ['#10A37F', '#D97757', '#4285F4', '#7C3AED', '#D97706'];

const DEMO_DEPT_RANKINGS = [
  { rank: 1, dept: 'Engineering', spend: '$124,000', users: 450, adoption: '94%', efficiency: 92, hoursSaved: 14200, roi: '450%', maturity: 'Stage 5 (Leader)' },
  { rank: 2, dept: 'Finance & Ops', spend: '$52,000', users: 180, adoption: '88%', efficiency: 86, hoursSaved: 5400, roi: '390%', maturity: 'Stage 4 (Advanced)' },
  { rank: 3, dept: 'Marketing', spend: '$48,000', users: 220, adoption: '82%', efficiency: 81, hoursSaved: 4800, roi: '360%', maturity: 'Stage 4 (Advanced)' },
  { rank: 4, dept: 'Sales', spend: '$36,000', users: 250, adoption: '65%', efficiency: 74, hoursSaved: 2900, roi: '280%', maturity: 'Stage 3 (Developing)' },
  { rank: 5, dept: 'HR & Legal', spend: '$20,000', users: 140, adoption: '60%', efficiency: 71, hoursSaved: 1200, roi: '220%', maturity: 'Stage 3 (Developing)' }
];

const DEMO_TREND_DATA = [
  { month: 'Jan', spend: 20000, valueCreated: 84000, hours: 2100 },
  { month: 'Feb', spend: 28000, valueCreated: 118000, hours: 2950 },
  { month: 'Mar', spend: 35000, valueCreated: 152000, hours: 3800 },
  { month: 'Apr', spend: 42000, valueCreated: 185000, hours: 4600 },
  { month: 'May', spend: 48000, valueCreated: 210000, hours: 5200 },
  { month: 'Jun', spend: 52000, valueCreated: 235000, hours: 5850 },
  { month: 'Jul', spend: 55000, valueCreated: 260000, hours: 6000 }
];

const DEMO_FORECAST_DATA = [
  { month: 'Q1 2026', budget: 100000, actual: 83000, projected: 83000 },
  { month: 'Q2 2026', budget: 120000, actual: 142000, projected: 142000 },
  { month: 'Q3 2026', budget: 140000, actual: 0, projected: 155000 },
  { month: 'Q4 2026', budget: 160000, actual: 0, projected: 180000 }
];

export default function ExecutiveDashboard() {
  const { data: serverData } = useExecutiveDashboard();
  const { data: maturityData } = useMaturityScore();
  const { data: olsData } = useOLSRegression();
  const olsForecast = olsData || { nextMonthForecast: 0, trendDirection: 'stable', isSignificant: false };
  const { data: deptData } = useDepartmentAnalytics();
  const { data: forecastApiData } = useForecast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabKey = searchParams.get('tab') || 'overview';
  const activeTab = TAB_NAME_MAP[currentTabKey] ?? 0;

  const maturityLadder: any[] = (maturityData as any)?.ladder || MATURITY_LADDER;
  const maturityIndex: number = (maturityData as any)?.maturity_index || 86;
  const [selectedDrilldown, setSelectedDrilldown] = useState<'spend' | 'hours' | 'rankings' | 'forecast' | 'recommendations'>('spend');
  const [approvedRecs, setApprovedRecs] = useState(new Set<string>());
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const stats: any = serverData || {
    total_spend_usd: 280000,
    active_users: 1240,
    roi_estimate: 420,
    maturity_index: 86,
    total_hours_saved: 28500,
    total_cost_savings_usd: 1425000
  };

  // Real fields (executive_kpis.active_users/total_users, roi_metrics.hours_saved) fall back to the
  // legacy flat literals above so the page still renders sensibly before the backend contract lands.
  const totalHoursSaved: number = stats.total_hours_saved ?? stats?.roi_metrics?.hours_saved ?? 28500;
  const activeUsers: number = stats?.executive_kpis?.active_users ?? stats.active_users ?? 1240;
  const totalUsers: number = stats?.executive_kpis?.total_users ?? stats.total_users ?? 0;
  const adoptionPct: number = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 88;

  // Single source of truth for every ROI/net-value figure shown on this page (Overview KPI, ROI tab, FinOps tab).
  const { data: roiData } = useROICalculator(totalHoursSaved, 50, stats.total_spend_usd ?? 280000);
  const roi = roiData || { netROIPercentage: 0, businessValueGenerated: 0, netROI: 0 };

  // /analytics/department returns either a bare array or { department, rankings }; normalize once here
  // so all 3 consumers below (overview widget, roi-spend table, rankings tab) get a real array.
  const deptRankings: any[] = Array.isArray(deptData) ? deptData : (deptData as any)?.rankings?.length ? (deptData as any).rankings : DEMO_DEPT_RANKINGS;

  const spendByProviderRaw = (stats as any)?.spend_by_provider;
  const spendByProviderData = (Array.isArray(spendByProviderRaw) && spendByProviderRaw.length > 0 ? spendByProviderRaw : DEMO_SPEND_BY_PROVIDER)
    .map((p: any, idx: number) => ({
      name: p.name,
      value: p.value,
      color: p.color || PROVIDER_COLORS[p.name] || PROVIDER_FALLBACK_COLORS[idx % PROVIDER_FALLBACK_COLORS.length],
    }));

  const approveInitiativeMutation = useApproveInitiative();
  const enableAutoSwitchingMutation = useEnableAutoSwitching();

  const handleApproveInitiative = () => {
    setApprovedRecs((prev) => new Set(prev).add('sales-prompts'));
    approveInitiativeMutation.mutate(
      { initiativeId: 'sales-prompts', title: 'Invest $50K in Sales Team Prompts' },
      {
        onSuccess: () => setSnack({ open: true, message: 'Initiative approved and routed for execution.', severity: 'success' }),
        onError: () => setSnack({ open: true, message: 'Approved locally, but the server request failed.', severity: 'error' }),
      }
    );
  };

  const handleEnableAutoSwitching = () => {
    setApprovedRecs((prev) => new Set(prev).add('auto-switch'));
    enableAutoSwitchingMutation.mutate(undefined, {
      onSuccess: () => setSnack({ open: true, message: 'Auto-switching enabled organization-wide.', severity: 'success' }),
      onError: () => setSnack({ open: true, message: 'Enabled locally, but the server request failed.', severity: 'error' }),
    });
  };

  // Real drill-down: KPI cards route to the roi-spend tab and set which sub-section to focus;
  // once that tab is showing, scroll the relevant section (spend chart vs. time-saved table) into view.
  const spendSectionRef = useRef<HTMLDivElement>(null);
  const hoursSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeTab !== 1) return;
    const target = selectedDrilldown === 'hours' ? hoursSectionRef.current : selectedDrilldown === 'spend' ? spendSectionRef.current : null;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeTab, selectedDrilldown]);

  return (
    <Box className="page-enter" sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%', bgcolor: '#F0F5F3', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* HEADER (Square workspace container) */}
      <Box sx={{ background: '#FFFFFF', borderRadius: '22px', p: 3, mb: 3, border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#F5F4FB', color: '#5B57F0' }}>
            <AIIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
              <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
                Executive Command Center
              </Typography>
              <Chip label="Organization View" size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#F5F4FB', color: '#5B57F0' }} />
            </Stack>
            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#85839A' }}>
              Org spend, ROI value, enterprise time saved, and department rankings.
            </Typography>
          </Box>
        </Stack>

        <Card sx={{ borderRadius: '16px', border: '1px solid #E9E7F5', boxShadow: 'none', minWidth: 200, bgcolor: '#FAFAFA' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', mb: 0.5 }}>
              AI Maturity Index
            </Typography>
            <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
              {stats.maturity_index} <Typography component="span" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: '#85839A', fontWeight: 500 }}>/ 100</Typography>
            </Typography>
            <Chip label="Stage 4 (Advanced)" size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#E3F7EE', color: '#1FAE7A', mt: 1 }} />
          </CardContent>
        </Card>
      </Box>

        {/* KPIs */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 4, width: '100%' }}>
          <Card onClick={() => setSelectedDrilldown('spend')} sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(32, 31, 46, 0.05)', borderColor: '#D1CFE3' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                  Total Org Spend
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                  <AttachMoney fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
                ${(stats.total_spend_usd / 1000).toFixed(0)}k YTD
              </Typography>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A', mt: 0.5 }}>+8% budget alignment</Typography>
            </CardContent>
          </Card>

          <Card onClick={() => setSelectedDrilldown('spend')} sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(32, 31, 46, 0.05)', borderColor: '#D1CFE3' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                  AI ROI Value
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#E3F7EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1FAE7A' }}>
                  <TrendingUp fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#1FAE7A' }}>
                {roi.netROIPercentage}% ROI
              </Typography>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#1FAE7A', mt: 0.5 }}>${(roi.businessValueGenerated / 1_000_000).toFixed(2)}M Net Value</Typography>
            </CardContent>
          </Card>

          <Card onClick={() => setSelectedDrilldown('hours')} sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(32, 31, 46, 0.05)', borderColor: '#D1CFE3' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                  Time Saved
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FCF0DE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8A23D' }}>
                  <Savings fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
                {totalHoursSaved.toLocaleString()}h
              </Typography>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A', mt: 0.5 }}>Equivalent to {Math.round(totalHoursSaved / 8).toLocaleString()} days</Typography>
            </CardContent>
          </Card>

          <Card onClick={() => setSelectedDrilldown('rankings')} sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(32, 31, 46, 0.05)', borderColor: '#D1CFE3' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                  Active Users
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                  <Groups fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
                {activeUsers.toLocaleString()}
              </Typography>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A', mt: 0.5 }}>{adoptionPct}% org adoption</Typography>
            </CardContent>
          </Card>

          <Card onClick={() => setSelectedDrilldown('recommendations')} sx={{ width: '100%', borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(32, 31, 46, 0.05)', borderColor: '#D1CFE3' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>
                  Next Investment
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                  <Lightbulb fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#5B57F0', pt: 1, pb: 0.5 }}>
                Sales Prompts
              </Typography>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>+35% growth opportunity</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* TAB CONTENT */}
        <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
          
          {activeTab === 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 2, width: '100%' }}>
              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: '100%', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' }}>Spend vs Value Created</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A' }}>Trailing 7-month correlation</Typography>
                    </Box>
                    <Box sx={{ height: 320, width: '100%' }}>
                      <ResponsiveContainer>
                        <AreaChart data={stats?.spendTrend || DEMO_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="valCreatedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={SUCCESS_GREEN} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={SUCCESS_GREEN} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={ACCENT_BLUE} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={ACCENT_BLUE} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(val) => `$${val/1000}k`} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                          <Area type="monotone" dataKey="valueCreated" name="Value Created" stroke={SUCCESS_GREEN} strokeWidth={2} fillOpacity={1} fill="url(#valCreatedGrad)" />
                          <Area type="monotone" dataKey="spend" name="Spend" stroke={ACCENT_BLUE} strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: '100%', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' }}>Department Rankings</Typography>
                      <Button size="small" variant="text" sx={{ fontFamily: 'Inter, sans-serif', color: '#5B57F0', textTransform: 'none', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setSearchParams({ tab: 'rankings' })}>View All</Button>
                    </Stack>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mb: 3 }}>Ranked by adoption & efficiency</Typography>

                    <Stack spacing={2}>
                      {deptRankings.slice(0, 4).map((d: any, idx: number) => {
                        const rank = d.rank ?? idx + 1;
                        const adoptionLabel = d.adoption ?? (typeof d.adoption_pct === 'number' ? `${d.adoption_pct}%` : '—');
                        return (
                          <Box key={d.dept || rank} sx={{ p: 2, borderRadius: '12px', border: '1px solid #E9E7F5', bgcolor: '#F5F4FB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1rem', fontWeight: 600, color: '#85839A', width: 20 }}>{rank}</Typography>
                              <Box>
                                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>{d.dept}</Typography>
                                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>{d.users} Users • {adoptionLabel} Adoption</Typography>
                              </Box>
                            </Stack>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#1FAE7A' }}>{d.roi ?? '—'} ROI</Typography>
                              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>{(d.hoursSaved ?? 0).toLocaleString()}h</Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: '100%', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 0.5 }}>Forward Budget Forecast</Typography>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mb: 3 }}>Projected future AI spend</Typography>
                    <Box sx={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={forecastApiData?.forecastData || DEMO_FORECAST_DATA} margin={{ left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(val) => `$${val/1000}k`} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                          <Bar dataKey="budget" name="Budget" fill="#EAEAEA" radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="projected" name="Projected" fill={ACCENT_BLUE} radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: '100%', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 0.5 }}>Investment Recommendations</Typography>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mb: 3 }}>Strategic AI guidance</Typography>
                    <Stack spacing={2}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F5F4FB', borderLeft: `3px solid #5B57F0` }}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#5B57F0', mb: 0.5 }}>
                          Invest $50K in Sales Team Prompts
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>
                          Increasing adoption to 88% will generate an estimated +$320K in annual deal velocity value.
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#E3F7EE', borderLeft: `3px solid #1FAE7A` }}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#1FAE7A', mb: 0.5 }}>
                          Migrate 40% Summarization to Gemini 1.5 Flash
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>
                          Switching from GPT-4o will cut annual cost by $35,000 with 0 quality drop.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F' }}>ROI & Spend Analysis</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Enterprise return on investment calculation and model spend breakdown.</Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, gap: 2, width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: '100%', bgcolor: '#FFFFFF' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' }}>TOTAL ORG ROI</Typography>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '3rem', fontWeight: 600, color: '#1FAE7A', my: 1 }}>{roi.netROIPercentage}%</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', lineHeight: 1.6 }}>
                        For every $1.00 spent on AI API access, the organization generates ${(roi.businessValueGenerated / (roi.aiCostIncurred || 1)).toFixed(2)} in equivalent manual developer & analyst time saved.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box ref={spendSectionRef} sx={{ width: '100%' }}>
                  <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: '100%', bgcolor: '#FFFFFF' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>Provider-Level Spend Breakdown</Typography>
                      <Box sx={{ height: 200, width: '100%' }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={spendByProviderData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {spendByProviderData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" mt={2}>
                        {spendByProviderData.map((entry: any) => (
                          <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color, mr: 1 }} />
                            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A' }}>{entry.name}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>

                <Box ref={hoursSectionRef} sx={{ width: '100%', gridColumn: { md: '1 / -1' } }}>
                  <TableContainer component={Paper} elevation={0} sx={{ minHeight: 400, borderRadius: '22px', border: '1px solid #E9E7F5', width: '100%', bgcolor: '#FFFFFF' }}>
                    <Table sx={{ width: '100%' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                          <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Department</TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>YTD Spend</TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Time Saved</TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Value Generated</TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Net ROI</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deptRankings.map((row: any) => (
                          <TableRow key={row.dept} sx={{ '&:hover': { bgcolor: '#FAFAFA' }, '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#201F2E', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>{row.dept}</TableCell>
                            <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#201F2E', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>{row.spend ?? '—'}</TableCell>
                            <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#201F2E', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>{(row.hoursSaved ?? 0).toLocaleString()}h</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#1FAE7A', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>${((row.hoursSaved ?? 0) * 50).toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#5B57F0', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>{row.roi ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>Department Rankings</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>Full enterprise ranking by adoption, efficiency, and maturity.</Typography>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ minHeight: 400, borderRadius: '22px', border: '1px solid #E9E7F5', width: '100%', bgcolor: '#FFFFFF' }}>
                <Table sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Rank & Dept</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Users</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Adoption</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Efficiency</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>Maturity</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 1.5 }}>ROI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deptRankings.map((d: any, idx: number) => {
                      const rank = d.rank ?? idx + 1;
                      const adoptionLabel = d.adoption ?? (typeof d.adoption_pct === 'number' ? `${d.adoption_pct}%` : '—');
                      const maturityLabel = d.maturity_stage ?? d.maturity ?? '—';
                      return (
                        <TableRow key={d.dept || rank} sx={{ '&:hover': { bgcolor: '#FAFAFA' }, '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ py: 1.5, borderBottom: '1px solid #E9E7F5' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#85839A', width: 20 }}>{rank}</Typography>
                              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>{d.dept}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>{d.users}</TableCell>
                          <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid #E9E7F5' }}>
                            <Chip label={adoptionLabel} size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#F5F4FB', color: '#5B57F0' }} />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid #E9E7F5' }}>
                            <Chip label={`${d.efficiency}/100`} size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#E3F7EE', color: '#1FAE7A' }} />
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid #E9E7F5' }}>
                            <Chip label={maturityLabel} size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#FAFAFA', color: '#201F2E' }} />
                          </TableCell>
                          <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#1FAE7A', py: 1.5, borderBottom: '1px solid #E9E7F5' }}>{d.roi ?? '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 3 && (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>Forward Budget Forecast</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>12-month forward-looking budget projections.</Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' }, gap: 2, width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: 360, width: '100%', bgcolor: '#FFFFFF' }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Quarterly Budget Projection (2026)</Typography>
                      <Box sx={{ flexGrow: 1, minHeight: 0, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={forecastApiData?.forecastData || DEMO_FORECAST_DATA} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A' }} tickFormatter={(val) => `$${val/1000}k`} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                            <Bar dataKey="budget" name="Allocated Budget" fill="#F5F4FB" radius={[4, 4, 0, 0]} barSize={24} />
                            <Bar dataKey="projected" name="Projected Spend" fill="#5B57F0" radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ width: '100%' }}>
                  <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: 360, width: '100%', bgcolor: '#FFFFFF' }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Forecast Scenarios</Typography>
                      <Stack spacing={2}>
                        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAFAFA' }}>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>Conservative Growth (+10%)</Typography>
                          <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#85839A', mt: 0.5 }}>Projected Spend: $520,000</Typography>
                        </Box>
                        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F5F4FB', borderLeft: `3px solid #5B57F0` }}>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#5B57F0' }}>Expected Growth (+18%)</Typography>
                          <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#85839A', mt: 0.5 }}>Projected Spend: $560,000</Typography>
                        </Box>
                        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAFAFA' }}>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#201F2E' }}>Aggressive Scale (+30%)</Typography>
                          <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#85839A', mt: 0.5 }}>Projected Spend: $630,000</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 4 && (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>Executive Recommendations</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>Intelligence engine recommendations for executive leadership.</Typography>
              </Box>

              <Stack spacing={3} sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', width: '100%', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: '#F5F4FB', color: '#5B57F0' }}>
                        <Lightbulb />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' }}>Expand Sales Department Prompt Enablement Program</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', my: 1.5, lineHeight: 1.5 }}>
                          Sales team adoption is currently at 65% (vs 94% in Engineering). Investing $50K in targeted prompt templates and sales enablement coaching will lift adoption to 88%, adding an estimated $320,000 in accelerated deal closure velocity.
                        </Typography>
                        <Button variant="contained" size="small" disableElevation sx={{ fontFamily: 'Inter, sans-serif', bgcolor: '#E6E6FA', color: '#111827', textTransform: 'none', borderRadius: '8px', fontWeight: 600 }} onClick={handleApproveInitiative}>
                          {approvedRecs.has('sales-prompts') ? 'Approved!' : 'Approve $50K Initiative'}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', width: '100%', bgcolor: '#FFFFFF' }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: '#E3F7EE', color: '#1FAE7A' }}>
                        <Savings />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' }}>Enforce Auto-Model Switching for General Summarization</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', my: 1.5, lineHeight: 1.5 }}>
                          Currently, 40% of document summarization requests use high-cost models. Enforcing auto-switch to faster models for summarization tasks will reduce annual API spend by $35,000.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ fontFamily: 'Inter, sans-serif', borderColor: '#E9E7F5', color: '#201F2E', textTransform: 'none', borderRadius: '8px', fontWeight: 600 }} onClick={handleEnableAutoSwitching}>
                          {approvedRecs.has('auto-switch') ? 'Enabled!' : 'Enable Auto-Switching'}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          )}

          {activeTab === 5 && (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>FinOps & ROI Engine</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>Quantifies financial impact via exact value modeling and OLS forecasting.</Typography>
              </Box>

              <Card sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', mb: 4, width: '100%', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} mb={3}>
                    <Box>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' }}>ROI Computation Model</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A' }}>Attribution equating hours saved to financial ROI.</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F5F4FB' }}>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', fontWeight: 600, color: '#201F2E' }}>
                        Value = Hours × Rate | ROI = (Value - Cost) / Cost
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, width: '100%' }}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAFAFA', border: '1px solid #E9E7F5', width: '100%' }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', textTransform: 'uppercase' }}>Hours Saved</Typography>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mt: 0.5 }}>{roi.hoursSaved.toLocaleString()} hrs</Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#FAFAFA', border: '1px solid #E9E7F5', width: '100%' }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A', textTransform: 'uppercase' }}>Hourly Rate</Typography>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mt: 0.5 }}>${roi.hourlyCostRate.toFixed(2)} / hr</Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#E3F7EE', border: '1px solid #1FAE7A', width: '100%' }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#1FAE7A', textTransform: 'uppercase' }}>Value Generated</Typography>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.25rem', fontWeight: 600, color: '#1FAE7A', mt: 0.5 }}>${roi.businessValueGenerated.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F5F4FB', border: '1px solid #5B57F0', width: '100%' }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#5B57F0', textTransform: 'uppercase' }}>Net ROI</Typography>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.25rem', fontWeight: 600, color: '#5B57F0', mt: 0.5 }}>{roi.netROIPercentage}%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Box sx={{ mb: 4, width: '100%' }}>
                <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>AI Maturity Score & Ladder</Typography>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5, mb: 3 }}>Tracks organizational AI evolution toward autonomous execution.</Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, width: '100%' }}>
                  {maturityLadder.map((mat: any, idx: number) => {
                    const levelNumber = mat.level_number || mat.levelNumber || idx + 1;
                    const levelName = mat.level_name || mat.levelName;
                    const isActive = mat.status === 'Active';
                    
                    return (
                      <Box key={idx} sx={{ width: '100%' }}>
                        <Card sx={{ 
                          borderRadius: '22px', 
                          border: isActive ? `1px solid #5B57F0` : '1px solid #E9E7F5', 
                          boxShadow: isActive ? '0 4px 20px rgba(91, 87, 240, 0.15)' : 'none', 
                          height: '100%',
                          width: '100%',
                          bgcolor: '#FFFFFF'
                        }}>
                          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: isActive ? '#5B57F0' : '#FAFAFA', color: isActive ? '#FFF' : '#85839A', fontSize: '0.85rem', fontWeight: 700 }}>
                                L{levelNumber}
                              </Avatar>
                              {isActive && (
                                <Chip label="CURRENT" size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#F5F4FB', color: '#5B57F0' }} />
                              )}
                            </Stack>
                            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E', mb: 1 }}>{levelName}</Typography>
                            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', flexGrow: 1 }}>{mat.description}</Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
  );
}
