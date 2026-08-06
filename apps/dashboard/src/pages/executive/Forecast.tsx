import React from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Stack } from '@mui/material';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useForecast } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';

const defaultMockData = [
  { quarter: 'Q1 2026', actualSpend: 120000, projectedSpend: 120000 },
  { quarter: 'Q2 2026', actualSpend: 145000, projectedSpend: 150000 },
  { quarter: 'Q3 2026', actualSpend: null, projectedSpend: 175000 },
  { quarter: 'Q4 2026', actualSpend: null, projectedSpend: 190000 },
];

const defaultKpis = [
  { label: 'Current Run Rate (Annual)', value: '$580,000' },
  { label: 'Projected EOY Spend', value: '$635,000' },
  { label: 'Budget Variance', value: '-2.4%' },
];

export default function Forecast() {
  const { data, isLoading } = useForecast();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  const chartData = data?.timeline || data?.forecastData || defaultMockData;
  const kpis = data?.kpis || defaultKpis;

  const standardCardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };

  return (
    <Box className="page-enter page-content" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: { xs: 1, md: 1.5 } }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            Quarterly Spend Forecast
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
            Projected actuals vs expected runway
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {kpis.map((kpi: any, idx: number) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ ...standardCardSx, borderTop: `3px solid ${ACCENT_BLUE}` }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 1 }}>
                    {kpi.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D2E', fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={standardCardSx}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Stack direction="row" spacing={3} mb={3} alignItems="center">
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' }}>
                Actual vs Projected Spend
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#F0F4F8' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>Actual</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 2, bgcolor: ACCENT_BLUE }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>Projected (OLS)</Typography>
                </Box>
              </Stack>
            </Stack>

            <Box sx={{ height: 450, width: '100%' }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,90,166,0.09)" />
                  <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 6px 24px rgba(31,90,166,0.10)' }} 
                  />
                  <Bar dataKey="actualSpend" name="Actual Spend" fill="#F0F4F8" barSize={40} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="projectedSpend" name="Projected Spend" stroke={ACCENT_BLUE} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}
