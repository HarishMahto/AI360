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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: '#0066CC' }} />
      </Box>
    );
  }

  const spendData = data?.spendData || mockSpendData;
  const chargebackData = data?.chargebackData || mockChargebackData;
  const totalYtdSpend = data?.totalYtdSpend || '$30,100';
  const percentAllocatedNum = 92;

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, width: '100%', bgcolor: '#F5F7FA', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)' }}>
        <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
          AI FinOps
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
          Track and manage AI budget allocations, actual spend, and team chargebacks.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                  Total YTD Spend
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <AttachMoney fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F', mb: 2 }}>
                {totalYtdSpend}
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F', fontWeight: 500 }}>Budget Allocated</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73' }}>{percentAllocatedNum}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={percentAllocatedNum} 
                sx={{ 
                  height: 5, 
                  borderRadius: 99, 
                  bgcolor: '#F5F5F7', 
                  '& .MuiLinearProgress-bar': { bgcolor: '#0066CC', borderRadius: 99 } 
                }} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Budget vs Actual Spend</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066CC" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#AEAEB2" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#AEAEB2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                      formatter={(value: number) => [`$${value}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="actual" stroke="#0066CC" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual Spend" />
                    <Area type="monotone" dataKey="budget" stroke="#AEAEB2" strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" name="Budget" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Department Chargebacks</Typography>
              <TableContainer sx={{ minHeight: 400,  borderRadius: 2, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Team</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Spend ($)</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {chargebackData.map((row: any) => (
                      <TableRow key={row.id} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#1D1D1F', fontWeight: 500 }}>{row.team}</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#6E6E73' }}>${row.spend.toLocaleString()}</TableCell>
                        <TableCell align="center" sx={{ py: 1.375, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                          <Chip 
                            label={row.status} 
                            size="small" 
                            sx={{ 
                              height: 22, 
                              fontSize: '0.67rem', 
                              fontWeight: 600, 
                              borderRadius: 1.5, 
                              bgcolor: row.status === 'Billed' ? 'rgba(52,199,89,0.10)' : 'rgba(255,149,0,0.10)', 
                              color: row.status === 'Billed' ? '#1A7F37' : '#9E5B00'
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
