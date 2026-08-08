import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemAvatar, Avatar, ListItemText, LinearProgress, Chip, CircularProgress, ButtonGroup, Button, Stack } from '@mui/material';
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
  const [period, setPeriod] = useState('7d');
  const { data, isLoading } = useTeamAnalytics({ period });

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

  const cardSx = { borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' };
  const sectionTitleSx = { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' };
  const labelCapsSx = { fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#85839A' };

  return (
    <Box className="page-enter" sx={{ p: 0, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        <Box sx={{ background: '#FFFFFF', borderRadius: '22px', p: 3, mb: 3, border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
              Team Analytics
            </Typography>
            <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#85839A', mt: 0.5 }}>
              Track adoption, token usage, and top performers across your team
            </Typography>
          </Box>
          <ButtonGroup size="small" sx={{ 
            bgcolor: '#FAFAFD', 
            borderRadius: '12px', 
            p: 0.5, 
            border: '1px solid #E9E7F5',
            '& .MuiButton-root': { border: 'none', color: '#85839A', fontFamily: 'Inter, sans-serif', borderRadius: '10px', textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', px: 2 },
            '& .Mui-active': { bgcolor: '#E6E6FA', color: '#111827', color: '#FFFFFF', fontWeight: 600 }
          }}>
            <Button className={period === '7d' ? 'Mui-active' : ''} onClick={() => setPeriod('7d')}>7 Days</Button>
            <Button className={period === '30d' ? 'Mui-active' : ''} onClick={() => setPeriod('30d')}>30 Days</Button>
            <Button className={period === '90d' ? 'Mui-active' : ''} onClick={() => setPeriod('90d')}>90 Days</Button>
          </ButtonGroup>
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3, width: '100%' }}>
          <Card sx={{ ...cardSx, width: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={labelCapsSx}>
                  TOTAL ACTIVE USERS
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F5F4FB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B57F0' }}>
                  <Groups fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>{activeUsers}</Typography>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#1FAE7A', mt: 0.5 }}>{activeUsersGrowth}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ ...cardSx, width: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={labelCapsSx}>
                  TEAM ADOPTION SCORE
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#E3F7EE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1FAE7A' }}>
                  <TrendingUp fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>{adoptionScore}/100</Typography>
              <Box mt={1.5}>
                <LinearProgress variant="determinate" value={adoptionScore} sx={{ height: 6, borderRadius: 3, bgcolor: '#F5F4FB', '& .MuiLinearProgress-bar': { bgcolor: '#1FAE7A', borderRadius: 3 } }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ ...cardSx, width: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={labelCapsSx}>
                  WEEKLY TOKEN USAGE
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FCF0DE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8A23D' }}>
                  <Assessment fontSize="small" />
                </Box>
              </Box>
              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>{weeklyTokens}</Typography>
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5 }}>Estimated cost: {estimatedCost}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' }, gap: 3, width: '100%' }}>
          <Card sx={{ ...cardSx, width: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ ...sectionTitleSx, mb: 3 }}>Usage Trends</Typography>
              <Box sx={{ height: 320, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E7F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A', fontFamily: 'Inter' }} dy={10} />
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A', fontFamily: 'Inter' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A', fontFamily: 'Inter' }} />
                    <Tooltip 
                      cursor={{ fill: '#F5F4FB' }}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', fontFamily: 'Inter' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: '#85839A', fontFamily: 'Inter' }} />
                    <Bar yAxisId="left" dataKey="tokens" fill="#5B57F0" name="Tokens Used" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="right" dataKey="activeUsers" fill="#1FAE7A" name="Active Users" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Stack spacing={3} sx={{ width: '100%' }}>
            <Card sx={{ ...cardSx, width: '100%' }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #E9E7F5' }}>
                  <Typography sx={sectionTitleSx}>Top Users</Typography>
                </Box>
                <List disablePadding>
                  {topUsers.map((user: any, idx: number) => (
                    <ListItem key={user.id} sx={{ px: 3, py: 2, borderBottom: idx < topUsers.length - 1 ? '1px solid #E9E7F5' : 'none', '&:hover': { bgcolor: '#F5F4FB' } }}>
                      <ListItemAvatar sx={{ minWidth: 50 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#F5F4FB', color: '#5B57F0', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Inter' }}>
                          {user.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={user.name} 
                        secondary={user.role} 
                        sx={{
                          '& .MuiListItemText-primary': { fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#201F2E' },
                          '& .MuiListItemText-secondary': { fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#85839A' }
                        }}
                      />
                      <Chip label={`Score: ${user.score}`} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#E3F7EE', color: '#1FAE7A' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ ...cardSx, width: '100%' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 2.5 } }}>
                <Typography sx={{ ...sectionTitleSx, mb: 3 }}>Model Distribution</Typography>
                <Box sx={{ height: 180, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.modelDistribution || mockModelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(data?.modelDistribution || mockModelData).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#5B57F0', '#1FAE7A', '#E8A23D', '#3A9BDC'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', fontFamily: 'Inter' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'Inter', color: '#85839A' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
