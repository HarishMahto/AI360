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
const COLORS = ['#1F5AA6', '#059669', '#D97706', '#7C3AED'];

export default function TeamAnalytics() {
  const { data, isLoading } = useTeamAnalytics();
  const [period, setPeriod] = useState('7d');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: '#1F5AA6' }} />
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

  const cardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };
  const sectionTitleSx = { fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' };
  const labelCapsSx = { fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' };

  return (
    <Box className="page-enter page-content" sx={{ p: { xs: 1, md: 1.5 }, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(31,90,166,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(31,90,166,0.09)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            Team Analytics
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
            Detailed breakdown of AI adoption, usage patterns, and top users.
          </Typography>
        </Box>
        <ButtonGroup variant="outlined" size="small" sx={{ 
          '& .MuiButton-root': { borderColor: 'rgba(31,90,166,0.16)', color: '#1A1D2E', textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: '#F0F4F8' } },
          '& .Mui-active': { bgcolor: '#1F5AA6 !important', color: '#FFF !important', borderColor: '#1F5AA6 !important' }
        }}>
          <Button className={period === '7d' ? 'Mui-active' : ''} onClick={() => setPeriod('7d')}>7 Days</Button>
          <Button className={period === '30d' ? 'Mui-active' : ''} onClick={() => setPeriod('30d')}>30 Days</Button>
          <Button className={period === '90d' ? 'Mui-active' : ''} onClick={() => setPeriod('90d')}>90 Days</Button>
        </ButtonGroup>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardSx, borderTop: '3px solid #1F5AA6' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={labelCapsSx}>
                  TOTAL ACTIVE USERS
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: 'rgba(31,90,166,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F5AA6' }}>
                  <Groups fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1A1D2E' }}>{activeUsers}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#059669', mt: 0.5 }}>{activeUsersGrowth}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardSx, borderTop: '3px solid #059669' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={labelCapsSx}>
                  TEAM ADOPTION SCORE
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: 'rgba(5,150,105,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <TrendingUp fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1A1D2E' }}>{adoptionScore}/100</Typography>
              <Box mt={1.5}>
                <LinearProgress variant="determinate" value={adoptionScore} sx={{ height: 5, borderRadius: 99, bgcolor: '#F0F4F8', '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 99 } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ ...cardSx, borderTop: '3px solid #D97706' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={labelCapsSx}>
                  WEEKLY TOKEN USAGE
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '6px', bgcolor: 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                  <Assessment fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: '#1A1D2E' }}>{weeklyTokens}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5 }}>Estimated cost: {estimatedCost}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ ...cardSx, borderTop: '3px solid #7C3AED' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Usage Trends</Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,90,166,0.09)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(31,90,166,0.04)' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 4px 16px rgba(31,90,166,0.10)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: '#4B5563' }} />
                    <Bar yAxisId="left" dataKey="tokens" fill="#1F5AA6" name="Tokens Used" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="activeUsers" fill="#059669" name="Active Users" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ ...cardSx, borderTop: '3px solid #1F5AA6' }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box sx={{ p: 3, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                    <Typography sx={sectionTitleSx}>Top Users</Typography>
                  </Box>
                  <List disablePadding>
                    {topUsers.map((user: any, idx: number) => (
                      <ListItem key={user.id} sx={{ px: 2.5, py: 1.5, borderBottom: idx < topUsers.length - 1 ? '1px solid rgba(31,90,166,0.09)' : 'none', '&:hover': { bgcolor: '#F0F4F8' } }}>
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#F0F4F8', color: '#1A1D2E', fontSize: '0.8125rem', fontWeight: 600 }}>
                            {user.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={user.name} 
                          secondary={user.role} 
                          primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1A1D2E' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem', color: '#4B5563' }}
                        />
                        <Chip label={`Score: ${user.score}`} size="small" sx={{ height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '5px', bgcolor: 'rgba(31,90,166,0.08)', color: '#1F5AA6' }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ ...cardSx, borderTop: '3px solid #60A5FA' }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
                  <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Model Distribution</Typography>
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
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 4px 16px rgba(31,90,166,0.10)' }} />
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
