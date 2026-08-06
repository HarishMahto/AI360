import React, { useState } from 'react';
import {
  Box, Grid, Typography, Chip, Stack, LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Avatar, Divider, Paper, Tabs, Tab, Button, Card, CardContent
} from '@mui/material';
import {
  TrendingUp, Groups, AttachMoney, EmojiEvents, AutoAwesome as AIIcon, MoreVert, Savings,
  Psychology, Speed, Assessment, Lightbulb, WorkspacePremium, ArrowForward, Layers, ChevronRight, ShowChart
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { useExecutiveDashboard, useMaturityScore, useOLSRegression } from '../../api/hooks';
import { MATURITY_LADDER } from '../../engines';

const ACCENT_BLUE = '#0066CC';
const SUCCESS_GREEN = '#34C759';
const WARNING_ORANGE = '#FF9500';
const DANGER_RED = '#FF3B30';

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
  const olsForecast = useOLSRegression().data!;
  const [activeTab, setActiveTab] = useState(0);

  const maturityLadder: any[] = (maturityData as any)?.ladder || MATURITY_LADDER;
  const maturityIndex: number = (maturityData as any)?.maturity_index || 86;
  const [selectedDrilldown, setSelectedDrilldown] = useState<'spend' | 'hours' | 'rankings' | 'forecast' | 'recommendations'>('spend');

  const stats = serverData || {
    total_spend_usd: 280000,
    active_users: 1240,
    roi_estimate: 420,
    maturity_index: 86,
    total_hours_saved: 28500,
    total_cost_savings_usd: 1425000
  };

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8, pt: 2, px: { xs: 2, md: 3 } }}>
      <Box sx={{ width: '100%' }}>
        
        {/* EXECUTIVE HEADER */}
        <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(0,102,204,0.08)', color: ACCENT_BLUE, border: '1px solid rgba(0,102,204,0.14)' }}>
              <AIIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
                  Executive Command Center
                </Typography>
                <Chip label="Organization View" size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(0,102,204,0.08)', color: ACCENT_BLUE }} />
              </Stack>
              <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73' }}>
                Org spend, ROI value, enterprise time saved, and department rankings.
              </Typography>
            </Box>
          </Stack>

          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', minWidth: 200 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 0.5 }}>
                AI Maturity Index
              </Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F' }}>
                {stats.maturity_index} <Typography component="span" sx={{ fontSize: '1rem', color: '#6E6E73', fontWeight: 500 }}>/ 100</Typography>
              </Typography>
              <Chip label="Stage 4 (Advanced)" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, borderRadius: 1, bgcolor: 'rgba(52,199,89,0.10)', color: '#1A7F37', mt: 1 }} />
            </CardContent>
          </Card>
        </Box>

        {/* KPIs */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card onClick={() => setSelectedDrilldown('spend')} sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                    Total Org Spend
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                    <AttachMoney fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                  ${(stats.total_spend_usd / 1000).toFixed(0)}k YTD
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>+8% budget alignment</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card onClick={() => setSelectedDrilldown('spend')} sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #0D9488', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                    AI ROI Value
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(13,148,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
                    <TrendingUp fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: SUCCESS_GREEN, fontVariantNumeric: 'tabular-nums' }}>
                  {stats.roi_estimate}% ROI
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: SUCCESS_GREEN, mt: 0.5 }}>$1.42M Net Value</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card onClick={() => setSelectedDrilldown('hours')} sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #D97706', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                    Time Saved
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                    <Savings fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                  28,500h
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Equivalent to 3,560 days</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card onClick={() => setSelectedDrilldown('rankings')} sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #7C3AED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                    Active Users
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                    <Groups fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                  1,240
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>88% org adoption</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card onClick={() => setSelectedDrilldown('recommendations')} sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                    Next Investment
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                    <Lightbulb fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: ACCENT_BLUE, pt: 1, pb: 0.5 }}>
                  Sales Prompts
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>+35% growth opportunity</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* TABS */}
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 4, borderBottom: '1px solid rgba(0,0,0,0.08)', '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0', bgcolor: ACCENT_BLUE } }}>
          <Tab disableRipple label="Overview" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab disableRipple label="ROI & Spend" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab disableRipple label="Rankings" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab disableRipple label="Forecast" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab disableRipple label="Recommendations" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab disableRipple label="Maturity Score" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
        </Tabs>

        {/* TAB CONTENT */}
        <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
          
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Spend vs Value Created</Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73' }}>Trailing 7-month correlation</Typography>
                    </Box>
                    <Box sx={{ height: 320, width: '100%' }}>
                      <ResponsiveContainer>
                        <AreaChart data={DEMO_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Department Rankings</Typography>
                      <Button size="small" variant="text" sx={{ color: ACCENT_BLUE, textTransform: 'none', fontSize: '0.8125rem' }} onClick={() => setActiveTab(2)}>View All</Button>
                    </Stack>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mb: 3 }}>Ranked by adoption & efficiency</Typography>

                    <Stack spacing={2}>
                      {DEMO_DEPT_RANKINGS.slice(0, 4).map((d) => (
                        <Box key={d.rank} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', bgcolor: '#F5F5F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#AEAEB2', width: 20 }}>{d.rank}</Typography>
                            <Box>
                              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>{d.dept}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{d.users} Users • {d.adoption} Adoption</Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: SUCCESS_GREEN }}>{d.roi} ROI</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{d.hoursSaved.toLocaleString()}h</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>Forward Budget Forecast</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mb: 3 }}>Projected future AI spend</Typography>
                    <Box sx={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DEMO_FORECAST_DATA} margin={{ left: -20, bottom: 0 }}>
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
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>Investment Recommendations</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mb: 3 }}>Strategic AI guidance</Typography>
                    <Stack spacing={2}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,102,204,0.04)', borderLeft: `3px solid ${ACCENT_BLUE}` }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: ACCENT_BLUE, mb: 0.5 }}>
                          Invest $50K in Sales Team Prompts
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>
                          Increasing adoption to 88% will generate an estimated +$320K in annual deal velocity value.
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(52,199,89,0.04)', borderLeft: `3px solid ${SUCCESS_GREEN}` }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: SUCCESS_GREEN, mb: 0.5 }}>
                          Migrate 40% Summarization to Gemini 1.5 Flash
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>
                          Switching from GPT-4o will cut annual cost by $35,000 with 0 quality drop.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F' }}>ROI & Spend Analysis</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Enterprise return on investment calculation and model spend breakdown.</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>TOTAL ORG ROI</Typography>
                      <Typography sx={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.03em', color: SUCCESS_GREEN, my: 1 }}>420%</Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', lineHeight: 1.6 }}>
                        For every $1.00 spent on AI API access, the organization generates $4.20 in equivalent manual developer & analyst time saved.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TableContainer component={Paper} elevation={0} sx={{ minHeight: 400,  borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                          <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Department</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>YTD Spend</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Time Saved</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Value Generated</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Net ROI</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {DEMO_DEPT_RANKINGS.map((row) => (
                          <TableRow key={row.dept} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 500, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{row.dept}</TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{row.spend}</TableCell>
                            <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{row.hoursSaved.toLocaleString()}h</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: SUCCESS_GREEN, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>${(row.hoursSaved * 50).toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: ACCENT_BLUE, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{row.roi}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F' }}>Department Rankings</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Full enterprise ranking by adoption, efficiency, and maturity.</Typography>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ minHeight: 400,  borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Rank & Dept</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Users</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Adoption</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Efficiency</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Maturity</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>ROI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DEMO_DEPT_RANKINGS.map((d) => (
                      <TableRow key={d.rank} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#AEAEB2', width: 20 }}>{d.rank}</Typography>
                            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1D1D1F' }}>{d.dept}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{d.users}</TableCell>
                        <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Chip label={d.adoption} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(0,102,204,0.08)', color: ACCENT_BLUE }} />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Chip label={`${d.efficiency}/100`} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(52,199,89,0.10)', color: '#1A7F37' }} />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Chip label={d.maturity} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: '#EAEAEA', color: '#1D1D1F' }} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: SUCCESS_GREEN, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{d.roi}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F' }}>Forward Budget Forecast</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>12-month forward-looking budget projections.</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: 360 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 3 }}>Quarterly Budget Projection (2026)</Typography>
                      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={DEMO_FORECAST_DATA} margin={{ left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(val) => `$${val/1000}k`} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                            <Bar dataKey="budget" name="Allocated Budget" fill="#EAEAEA" radius={[4, 4, 0, 0]} barSize={24} />
                            <Bar dataKey="projected" name="Projected Spend" fill={ACCENT_BLUE} radius={[4, 4, 0, 0]} barSize={24} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: 360 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 3 }}>Forecast Scenarios</Typography>
                      <Stack spacing={2}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F5F5F7' }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>Conservative Growth (+10%)</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Projected Spend: $520,000</Typography>
                        </Box>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,102,204,0.04)', borderLeft: `3px solid ${ACCENT_BLUE}` }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: ACCENT_BLUE }}>Expected Growth (+18%)</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Projected Spend: $560,000</Typography>
                        </Box>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F5F5F7' }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>Aggressive Scale (+30%)</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Projected Spend: $630,000</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 4 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F' }}>Executive Recommendations</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Intelligence engine recommendations for executive leadership.</Typography>
              </Box>

              <Stack spacing={3}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'rgba(0,102,204,0.08)', color: ACCENT_BLUE }}>
                        <Lightbulb />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Expand Sales Department Prompt Enablement Program</Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', my: 1.5, lineHeight: 1.5 }}>
                          Sales team adoption is currently at 65% (vs 94% in Engineering). Investing $50K in targeted prompt templates and sales enablement coaching will lift adoption to 88%, adding an estimated $320,000 in accelerated deal closure velocity.
                        </Typography>
                        <Button variant="contained" size="small" disableElevation sx={{ bgcolor: ACCENT_BLUE, textTransform: 'none', borderRadius: 2 }}>Approve $50K Initiative</Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar sx={{ bgcolor: 'rgba(52,199,89,0.10)', color: SUCCESS_GREEN }}>
                        <Savings />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Enforce Auto-Model Switching for General Summarization</Typography>
                        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', my: 1.5, lineHeight: 1.5 }}>
                          Currently, 40% of document summarization requests use high-cost models. Enforcing auto-switch to faster models for summarization tasks will reduce annual API spend by $35,000.
                        </Typography>
                        <Button variant="outlined" size="small" sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#1D1D1F', textTransform: 'none', borderRadius: 2 }}>Enable Auto-Switching</Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          )}

          {activeTab === 5 && (
            <Box>
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F' }}>FinOps & ROI Engine</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Quantifies financial impact via exact value modeling and OLS forecasting.</Typography>
              </Box>

              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} mb={3}>
                    <Box>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>ROI Computation Model</Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73' }}>Attribution equating hours saved to financial ROI.</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F5F5F7' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', fontFamily: 'monospace' }}>
                        Value = Hours × Rate | ROI = (Value - Cost) / Cost
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FAFAFA', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase' }}>Hours Saved</Typography>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F', mt: 0.5 }}>28,500 hrs</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FAFAFA', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase' }}>Hourly Rate</Typography>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F', mt: 0.5 }}>$50.00 / hr</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(52,199,89,0.04)', border: '1px solid rgba(52,199,89,0.1)' }}>
                        <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, color: SUCCESS_GREEN, textTransform: 'uppercase' }}>Value Generated</Typography>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: SUCCESS_GREEN, mt: 0.5 }}>$1,425,000</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,102,204,0.04)', border: '1px solid rgba(0,102,204,0.1)' }}>
                        <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, color: ACCENT_BLUE, textTransform: 'uppercase' }}>Net ROI</Typography>
                        <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: ACCENT_BLUE, mt: 0.5 }}>409%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1D1D1F' }}>AI Maturity Score & Ladder</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5, mb: 3 }}>Tracks organizational AI evolution toward autonomous execution.</Typography>
                
                <Grid container spacing={3}>
                  {maturityLadder.map((mat: any, idx: number) => {
                    const levelNumber = mat.level_number || mat.levelNumber || idx + 1;
                    const levelName = mat.level_name || mat.levelName;
                    const isActive = mat.status === 'Active';
                    
                    return (
                      <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Card sx={{ 
                          borderRadius: 3.5, 
                          border: isActive ? `1px solid ${ACCENT_BLUE}` : '1px solid rgba(0,0,0,0.08)', 
                          boxShadow: isActive ? '0 4px 16px rgba(0,102,204,0.15)' : 'none', 
                          height: '100%' 
                        }}>
                          <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: isActive ? ACCENT_BLUE : '#F5F5F7', color: isActive ? '#FFF' : '#6E6E73', fontSize: '0.8125rem', fontWeight: 700 }}>
                                L{levelNumber}
                              </Avatar>
                              {isActive && (
                                <Chip label="CURRENT" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600, borderRadius: 1, bgcolor: 'rgba(0,102,204,0.1)', color: ACCENT_BLUE }} />
                              )}
                            </Stack>
                            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 1 }}>{levelName}</Typography>
                            <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', flexGrow: 1 }}>{mat.description}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
}
