import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack
} from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, Speed, AccessTime } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const BRAND_COLOR = '#1F5AA6';

export default function Analytics() {
  const trendData = [
    { day: 'Mon', score: 72, tokens: 4200 },
    { day: 'Tue', score: 76, tokens: 3800 },
    { day: 'Wed', score: 80, tokens: 5100 },
    { day: 'Thu', score: 82, tokens: 2900 },
    { day: 'Fri', score: 85, tokens: 3100 },
    { day: 'Sat', score: 88, tokens: 1200 },
    { day: 'Sun', score: 92, tokens: 800 }
  ];

  return (
    <Box className="page-enter page-content" sx={{ p: { xs: 1, md: 1.5 }, width: '100%', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(5,150,105,0.03) 100%)', borderRadius: 3, p: 3, mb: 3, border: '1px solid rgba(31,90,166,0.09)' }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>Analytics</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>Track growth and token consumption</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, borderTop: '3px solid #1F5AA6' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#1F5AA6', 0.1) }}>
                <TrendingUp fontSize="small" sx={{ color: '#1F5AA6' }}/>
              </Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 1 }}>AVG SCORE</Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D2E', fontVariantNumeric: 'tabular-nums' }}>84/100</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#059669', mt: 0.5 }}>+15% this month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, borderTop: '3px solid #60A5FA' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#60A5FA', 0.1) }}>
                <Speed fontSize="small" sx={{ color: '#60A5FA' }}/>
              </Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 1 }}>TOKENS CONSUMED</Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D2E', fontVariantNumeric: 'tabular-nums' }}>21.1k</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5 }}>72% saved via optimization</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, borderTop: '3px solid #D97706' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#D97706', 0.1) }}>
                <AccessTime fontSize="small" sx={{ color: '#D97706' }}/>
              </Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 1 }}>HOURS SAVED</Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D2E', fontVariantNumeric: 'tabular-nums' }}>42.5h</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5 }}>Equivalent to 5.3 work days</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Growth Trend</Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_COLOR} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={BRAND_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                  <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(31,90,166,0.1)' }} />
                  <Area type="monotone" dataKey="score" stroke={BRAND_COLOR} strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Coaching Tips</Typography>
            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F0F4F8', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E' }}>Use concrete examples</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5 }}>Pass sample JSON or expected output.</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F0F4F8', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E' }}>Mention framework version</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5 }}>Specify Java 21, React 19, Spring Boot 3.</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F0F4F8', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E' }}>Specify output format</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5 }}>Request bullet points or Markdown table.</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, p: 3 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Usage Summary</Typography>
            <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(31,90,166,0.09)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                    <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>Period</TableCell>
                    <TableCell align="center" sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>Prompts</TableCell>
                    <TableCell align="center" sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>Tokens</TableCell>
                    <TableCell align="center" sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>Cost</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>Hours Saved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ '&:hover': { bgcolor: '#F0F4F8' } }}>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>Mid-day</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>34</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>—</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>$1.32</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>2.3h</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { bgcolor: '#F0F4F8' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>End-of-day</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>43</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>8,300</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>$1.80</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>2.8h</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
