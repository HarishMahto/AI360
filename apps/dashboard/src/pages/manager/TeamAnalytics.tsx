import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemAvatar, Avatar, ListItemText, LinearProgress, Chip, CircularProgress, ButtonGroup, Button } from '@mui/material';
import { Groups, TrendingUp, Assessment } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';
import { useTeamAnalytics } from '../../api/hooks';

const mockUsageData = [
  { name: 'Mon', tokens: 12000, activeUsers: 45 },
  { name: 'Tue', tokens: 19000, activeUsers: 52 },
  { name: 'Wed', tokens: 15000, activeUsers: 48 },
  { name: 'Thu', tokens: 22000, activeUsers: 60 },
  { name: 'Fri', tokens: 28000, activeUsers: 65 },
  { name: 'Sat', tokens: 9000, activeUsers: 20 },
  { name: 'Sun', tokens: 11000, activeUsers: 25 },
];

const mockTopUsers = [
  { id: 1, name: 'Alice Smith', role: 'Data Scientist', score: 98, avatar: 'A' },
  { id: 2, name: 'Bob Jones', role: 'Developer', score: 92, avatar: 'B' },
  { id: 3, name: 'Charlie Brown', role: 'Analyst', score: 85, avatar: 'C' },
  { id: 4, name: 'Diana Prince', role: 'Manager', score: 79, avatar: 'D' },
];

const mockModelData = [
  { name: 'GPT-4', value: 45 },
  { name: 'Claude 3', value: 30 },
  { name: 'Gemini', value: 15 },
  { name: 'Other', value: 10 },
];
const COLORS = ['#0066CC', '#34C759', '#FF9500', '#AEAEB2'];

export default function TeamAnalytics() {
  const { data, isLoading } = useTeamAnalytics();
  const [period, setPeriod] = useState('7d');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: '#0066CC' }} />
      </Box>
    );
  }

  const usageData = data?.usageData || mockUsageData;
  const topUsers = data?.topUsers || mockTopUsers;
  const activeUsers = data?.activeUsers || 142;
  const adoptionScore = data?.adoptionScore || 87;
  const weeklyTokens = data?.weeklyTokens || '116k';
  const estimatedCost = data?.estimatedCost || '$2.40';
  const activeUsersGrowth = data?.activeUsersGrowth || '+12% this week';

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, width: '100%', bgcolor: '#F5F7FA', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
            Team Analytics
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
            Detailed breakdown of AI adoption, usage patterns, and top users.
          </Typography>
        </Box>
        <ButtonGroup variant="outlined" size="small" sx={{ 
          '& .MuiButton-root': { borderColor: 'rgba(0,0,0,0.12)', color: '#1D1D1F', textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: '#F5F5F7' } },
          '& .Mui-active': { bgcolor: '#0066CC !important', color: '#FFF !important', borderColor: '#0066CC !important' }
        }}>
          <Button className={period === '7d' ? 'Mui-active' : ''} onClick={() => setPeriod('7d')}>7 Days</Button>
          <Button className={period === '30d' ? 'Mui-active' : ''} onClick={() => setPeriod('30d')}>30 Days</Button>
          <Button className={period === '90d' ? 'Mui-active' : ''} onClick={() => setPeriod('90d')}>90 Days</Button>
        </ButtonGroup>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                  TOTAL ACTIVE USERS
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Groups fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F' }}>{activeUsers}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#34C759', mt: 0.5 }}>{activeUsersGrowth}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #0D9488', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                  TEAM ADOPTION SCORE
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(13,148,136,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D9488' }}>
                  <TrendingUp fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F' }}>{adoptionScore}/100</Typography>
              <Box mt={1.5}>
                <LinearProgress variant="determinate" value={adoptionScore} sx={{ height: 5, borderRadius: 99, bgcolor: '#F5F5F7', '& .MuiLinearProgress-bar': { bgcolor: '#0066CC', borderRadius: 99 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderTop: '3px solid #D97706', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                  WEEKLY TOKEN USAGE
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                  <Assessment fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1D1D1F' }}>{weeklyTokens}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Estimated cost: {estimatedCost}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderTop: '3px solid #7C3AED', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Usage Trends</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="tokens" fill="#0066CC" name="Tokens Used" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="activeUsers" fill="#34C759" name="Active Users" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ borderTop: '3px solid #2563EB', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Top Users</Typography>
                  </Box>
                  <List disablePadding>
                    {topUsers.map((user: any, idx: number) => (
                      <ListItem key={user.id} sx={{ px: 2.5, py: 1.5, borderBottom: idx < topUsers.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', '&:hover': { bgcolor: '#F5F5F7' } }}>
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#F5F5F7', color: '#1D1D1F', fontSize: '0.8125rem', fontWeight: 600 }}>
                            {user.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={user.name} 
                          secondary={user.role} 
                          primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1D1D1F' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem', color: '#6E6E73' }}
                        />
                        <Chip label={`Score: ${user.score}`} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(0,102,204,0.08)', color: '#0066CC' }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ borderTop: '3px solid #0D9488', borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Model Distribution</Typography>
                  <Box sx={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockModelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {mockModelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
