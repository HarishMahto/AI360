import React from 'react';
import { Box, Typography, Card, CardContent, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: 0 }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both', px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 } }}>
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(31,90,166,0.02) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(31,90,166,0.09)' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            Organization Budgets
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', mt: 0.5 }}>
            Monitor AI token spending and manage budget limits
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <Card sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 3 }}>Spend vs Limits Overview</Typography>
              <Box sx={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,90,166,0.09)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip formatter={(value: number) => `$${value}`} contentStyle={{ borderRadius: 12, border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 6px 24px rgba(31,90,166,0.10)' }} cursor={{ fill: 'rgba(31,90,166,0.04)' }} />
                    <Legend />
                    <Bar dataKey="Spend" stackId="a" fill={ACCENT_BLUE} radius={[0, 0, 4, 4]} barSize={40} />
                    <Bar dataKey="Remaining" stackId="a" fill="#F0F4F8" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <TableContainer component={Card} sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                  <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5, px: 3 }}>Organization</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Monthly Limit</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Current Spend</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5, px: 3 }}>Utilization</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_BUDGETS.map((row) => {
                  const percent = Math.min((row.spend / row.limit) * 100, 100);
                  let barColor = '#059669';
                  if (percent > 70) barColor = '#D97706';
                  if (percent > 90) barColor = '#DC2626';

                  return (
                    <TableRow key={row.org} sx={{ '&:hover': { bgcolor: '#F0F4F8' }, '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E', py: 1.5, px: 3, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                        {row.org}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8125rem', color: '#1A1D2E', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                        ${row.limit.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: percent > 90 ? '#DC2626' : '#1A1D2E', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                        ${row.spend.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ width: '30%', py: 1.5, px: 3, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ flexGrow: 1, position: 'relative' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={percent} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 99,
                                bgcolor: '#F0F4F8',
                                '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 99 }
                              }} 
                            />
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E', minWidth: 35, textAlign: 'right' }}>
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
        </Box>
      </Box>
    </Box>
  );
}
