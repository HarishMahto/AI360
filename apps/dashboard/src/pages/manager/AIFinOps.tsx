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
  { id: 1, team: 'Engineering', spend: 3200, status: 'Billed' },
  { id: 2, team: 'Marketing', spend: 1100, status: 'Pending' },
  { id: 3, team: 'Sales', spend: 850, status: 'Billed' },
  { id: 4, team: 'HR', spend: 300, status: 'Billed' },
  { id: 5, team: 'Design', spend: 350, status: 'Pending' },
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

  const cardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };
  const sectionTitleSx = { fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' };
  const labelCapsSx = { fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' };

  return (
    <Box className="page-enter page-content" sx={{ p: { xs: 1, md: 1.5 }, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(31,90,166,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(31,90,166,0.09)' }}>
        <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
          AI FinOps
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
          Track and manage AI budget allocations, actual spend, and team chargebacks.
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardSx, borderTop: '3px solid #1F5AA6' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={labelCapsSx}>
                  Total YTD Spend
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: 'rgba(31,90,166,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F5AA6' }}>
                  <AttachMoney fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1A1D2E', mb: 2 }}>
                {totalYtdSpend}
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E', fontWeight: 500 }}>Budget Allocated</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563' }}>{percentAllocatedNum}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={percentAllocatedNum} 
                sx={{ 
                  height: 5, 
                  borderRadius: 99, 
                  bgcolor: '#F0F4F8', 
                  '& .MuiLinearProgress-bar': { bgcolor: '#1F5AA6', borderRadius: 99 } 
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Budget vs Actual Spend</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1F5AA6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#1F5AA6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,90,166,0.09)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12, fill: '#4B5563' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 4px 16px rgba(31,90,166,0.10)' }}
                      formatter={(value: number) => [`$${value}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: '#4B5563' }} />
                    <Area type="monotone" dataKey="actual" stroke="#1F5AA6" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual Spend" />
                    <Area type="monotone" dataKey="budget" stroke="#9CA3AF" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" name="Budget" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Department Chargebacks</Typography>
              <TableContainer sx={{ minHeight: 400, borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                      <TableCell sx={{ ...labelCapsSx, borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.25, px: 2 }}>Team</TableCell>
                      <TableCell align="right" sx={{ ...labelCapsSx, borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.25, px: 2 }}>Spend ($)</TableCell>
                      <TableCell align="center" sx={{ ...labelCapsSx, borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.25, px: 2 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chargebackData.map((row: any) => (
                      <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F0F4F8' }, '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(31,90,166,0.09)', color: '#1A1D2E', fontWeight: 500 }}>{row.team}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(31,90,166,0.09)', color: '#4B5563' }}>${row.spend.toLocaleString()}</TableCell>
                        <TableCell align="center" sx={{ py: 1.375, px: 2, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                          <Chip 
                            label={row.status} 
                            size="small" 
                            sx={{ 
                              height: 22, 
                              fontSize: '10px', 
                              fontWeight: 700, 
                              borderRadius: '5px', 
                              bgcolor: row.status === 'Billed' ? 'rgba(5,150,105,0.1)' : 'rgba(217,119,6,0.1)', 
                              color: row.status === 'Billed' ? '#059669' : '#D97706'
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
        </Grid>
      </Grid>
    </Box>
  );
}
