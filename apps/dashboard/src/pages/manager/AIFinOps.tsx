import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, LinearProgress } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useTeamAnalytics } from '../../api/hooks';

const mockSpendData = [
  { month: 'Jan', budget: 5000, actual: 4200 },
  { month: 'Feb', budget: 5000, actual: 4800 },
  { month: 'Mar', budget: 5000, actual: 5100 },
  { month: 'Apr', budget: 5500, actual: 4900 },
  { month: 'May', budget: 5500, actual: 5300 },
  { month: 'Jun', budget: 6000, actual: 5800 },
];

const mockChargebackData = [
  { id: 1, team: 'Engineering', owner: 'Sarah Jenkins', spend: 3200, budget: 3840, variance: 640, status: 'Billed' },
  { id: 2, team: 'Marketing', owner: 'Marcus Chen', spend: 1100, budget: 1320, variance: -120, status: 'Pending' },
  { id: 3, team: 'Sales', owner: 'Elena Rodriguez', spend: 850, budget: 1020, variance: 170, status: 'Billed' },
  { id: 4, team: 'HR', owner: 'David Kim', spend: 300, budget: 360, variance: 60, status: 'Billed' },
  { id: 5, team: 'Design', owner: 'Anita Patel', spend: 350, budget: 420, variance: -30, status: 'Pending' },
];

export default function AIFinOps() {
  const { data, isLoading } = useTeamAnalytics();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: '#1F5AA6' }} />
      </Box>
    );
  }

  const spendData = data?.spendData || mockSpendData;
  const chargebackData = data?.chargebackData || mockChargebackData;
  const totalYtdSpend = data?.totalYtdSpend || '$30,100';
  const percentAllocatedNum = 92;

  const cardSx = { borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' };
  const sectionTitleSx = { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' };
  const labelCapsSx = { fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' };

  return (
    <Box className="page-enter" sx={{ p: 0, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        <Box sx={{ background: '#FFFFFF', borderRadius: '22px', p: 3, mb: 3, border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)' }}>
          <Typography variant="h4" sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
            AI FinOps
          </Typography>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#85839A', mt: 0.5 }}>
            Track and manage AI budget allocations, actual spend, and team chargebacks.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, gap: 2, mb: 3, width: '100%' }}>
          <Box sx={{ width: '100%' }}>
            <Card sx={{ ...cardSx, width: '100%', height: '100%' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={labelCapsSx}>
                    Total YTD Spend
                  </Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                    <AttachMoney fontSize="small" />
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E', mb: 2 }}>
                  {totalYtdSpend}
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#201F2E', fontWeight: 600 }}>Budget Allocated</Typography>
                  <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#85839A' }}>{percentAllocatedNum}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={percentAllocatedNum} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3, 
                    bgcolor: '#F5F4FB', 
                    '& .MuiLinearProgress-bar': { bgcolor: '#5B57F0', borderRadius: 3 } 
                  }} 
                />
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ width: '100%' }}>
            <Card sx={{ ...cardSx, width: '100%', height: '100%' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
                <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Budget vs Actual Spend</Typography>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5B57F0" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#5B57F0" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#85839A" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#85839A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E7F5" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12, fill: '#85839A' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E9E7F5', boxShadow: '0 4px 16px rgba(32, 31, 46, 0.08)' }}
                        formatter={(value: number) => [`$${value}`, '']}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: '#85839A' }} />
                      <Area type="monotone" dataKey="actual" stroke="#5B57F0" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual Spend" />
                      <Area type="monotone" dataKey="budget" stroke="#85839A" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" name="Budget" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box sx={{ width: '100%', mb: 3 }}>
          <Card sx={{ ...cardSx, width: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Department Chargebacks</Typography>
              <TableContainer sx={{ minHeight: 400, borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: 'none', width: '100%' }}>
                <Table sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F4FB' }}>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Department</TableCell>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2 }}>Owner</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2 }}>Budget</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2 }}>Actual Spend</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2 }}>Variance</TableCell>
                      <TableCell align="center" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A', borderBottom: '1px solid #E9E7F5', py: 2, px: 3 }}>Billing Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chargebackData.map((row: any) => (
                      <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F5F4FB' }, '&:last-child td': { border: 0 }, height: 56 }}>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', px: 3, borderBottom: '1px solid #E9E7F5', color: '#201F2E', fontWeight: 600 }}>{row.team}</TableCell>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', borderBottom: '1px solid #E9E7F5', color: '#85839A' }}>{row.owner}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', borderBottom: '1px solid #E9E7F5', color: '#85839A' }}>${(row.budget ?? row.spend).toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 2, borderBottom: '1px solid #E9E7F5', color: '#201F2E', fontWeight: 600 }}>${row.spend.toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', px: 2, borderBottom: '1px solid #E9E7F5', fontWeight: 600, color: row.variance >= 0 ? '#1FAE7A' : '#E53E3E' }}>
                          {row.variance >= 0 ? '+' : '-'}${Math.abs(row.variance).toLocaleString()}
                        </TableCell>
                        <TableCell align="center" sx={{ px: 3, borderBottom: '1px solid #E9E7F5' }}>
                          <Chip
                            label={row.status}
                            size="small"
                            sx={{
                              fontFamily: 'Inter, sans-serif',
                              height: 22,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              bgcolor: row.status === 'Billed' ? '#E3F7EE' : '#FCF0DE',
                              color: row.status === 'Billed' ? '#1FAE7A' : '#E8A23D'
                            }}
                          />
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
