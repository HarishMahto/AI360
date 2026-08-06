import React from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Stack } from '@mui/material';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useForecast } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  const chartData = data?.timeline || data?.forecastData || defaultMockData;
  const kpis = data?.kpis || defaultKpis;

  return (
    <Box className="page-enter" sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
            Quarterly Spend Forecast
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
            Projected actuals vs expected runway
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpis.map((kpi: any, idx: number) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1 }}>
                    {kpi.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Stack direction="row" spacing={3} mb={3} alignItems="center">
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>
                Actual vs Projected Spend
              </Typography>
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: '#EAEAEA' }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>Actual</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 2, bgcolor: ACCENT_BLUE }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>Projected (OLS)</Typography>
                </Box>
              </Stack>
            </Stack>

            <Box sx={{ height: 450, width: '100%' }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                  <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} 
                  />
                  <Bar dataKey="actualSpend" name="Actual Spend" fill="#EAEAEA" barSize={40} radius={[4, 4, 0, 0]} />
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
