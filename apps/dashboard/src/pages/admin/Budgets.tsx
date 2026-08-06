import React from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';

const MOCK_BUDGETS = [
  { org: 'Acme Corp', limit: 5000, spend: 4230 },
  { org: 'Global Tech', limit: 2000, spend: 850 },
  { org: 'Startup Inc', limit: 500, spend: 490 },
  { org: 'Mega Financial', limit: 10000, spend: 2100 },
  { org: 'Design Studio', limit: 1500, spend: 1200 },
];

const chartData = MOCK_BUDGETS.map(b => ({
  name: b.org,
  Spend: b.spend,
  Remaining: b.limit - b.spend
}));

export default function Budgets() {
  const { isPending } = useAdminDashboard();

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F5F7FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
            Organization Budgets
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
            Monitor AI token spending and manage budget limits
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 3 }}>Spend vs Limits Overview</Typography>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(val) => `$${val}`} />
                      <Tooltip formatter={(value: number) => `$${value}`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} cursor={{ fill: 'rgba(0,102,204,0.04)' }} />
                      <Legend />
                      <Bar dataKey="Spend" stackId="a" fill={ACCENT_BLUE} radius={[0, 0, 4, 4]} barSize={40} />
                      <Bar dataKey="Remaining" stackId="a" fill="#EAEAEA" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <TableContainer component={Card} sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                    <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5, px: 3 }}>Organization</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Monthly Limit</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Current Spend</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5, px: 3 }}>Utilization</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_BUDGETS.map((row) => {
                    const percent = Math.min((row.spend / row.limit) * 100, 100);
                    let barColor = '#34C759';
                    if (percent > 70) barColor = '#FF9500';
                    if (percent > 90) barColor = '#FF3B30';

                    return (
                      <TableRow key={row.org} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F', py: 1.5, px: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          {row.org}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          ${row.limit.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: percent > 90 ? '#FF3B30' : '#1D1D1F', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          ${row.spend.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ width: '30%', py: 1.5, px: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={percent} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 99,
                                  bgcolor: '#F5F5F7',
                                  '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 99 }
                                }} 
                              />
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', minWidth: 35, textAlign: 'right' }}>
                              {Math.round(percent)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
