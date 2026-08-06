import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack
} from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, Speed, AccessTime } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const BRAND_COLOR = '#0066CC';

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
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, width: '100%', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: 3, p: 3, mb: 3, border: '1px solid rgba(37,99,235,0.07)' }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>Analytics</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Track growth and token consumption</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', borderTop: '3px solid #2563EB', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#2563EB', 0.1) }}>
                <TrendingUp fontSize="small" sx={{ color: '#2563EB' }}/>
              </Box>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1 }}>AVG SCORE</Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>84/100</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#34C759', mt: 0.5 }}>+15% this month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', borderTop: '3px solid #0D9488', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#0D9488', 0.1) }}>
                <Speed fontSize="small" sx={{ color: '#0D9488' }}/>
              </Box>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1 }}>TOKENS CONSUMED</Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>21.1k</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>72% saved via optimization</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', borderTop: '3px solid #D97706', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#D97706', 0.1) }}>
                <AccessTime fontSize="small" sx={{ color: '#D97706' }}/>
              </Box>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1 }}>HOURS SAVED</Typography>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>42.5h</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Equivalent to 5.3 work days</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Growth Trend</Typography>
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
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                  <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="score" stroke={BRAND_COLOR} strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Coaching Tips</Typography>
            <Stack spacing={2}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F5F5F7', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>Use concrete examples</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Pass sample JSON or expected output.</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F5F5F7', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>Mention framework version</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Specify Java 21, React 19, Spring Boot 3.</Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F5F5F7', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>Specify output format</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>Request bullet points or Markdown table.</Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Usage Summary</Typography>
            <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                    <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase' }}>Period</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase' }}>Prompts</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase' }}>Tokens</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase' }}>Cost</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', textTransform: 'uppercase' }}>Hours Saved</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ '&:hover': { bgcolor: '#F5F5F7' } }}>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>Mid-day</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>34</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>—</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>$1.32</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34C759' }}>2.3h</TableCell>
                  </TableRow>
                  <TableRow sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>End-of-day</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>43</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>8,300</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8125rem' }}>$1.80</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34C759' }}>2.8h</TableCell>
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
