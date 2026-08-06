import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Stack, ButtonGroup, Button } from '@mui/material';
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
  const [scenario, setScenario] = useState<'conservative'|'expected'|'aggressive'>('expected');
  const scenarioMultipliers = { conservative: 1.10, expected: 1.18, aggressive: 1.30 };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  const baseChartData = data?.timeline || data?.forecastData || defaultMockData;
  const chartData = baseChartData.map((d: any) => ({ ...d, projectedSpend: d.projectedSpend ? Math.round(d.projectedSpend * scenarioMultipliers[scenario] / 1.18) : null }));
  const kpis = data?.kpis || defaultKpis;

  const standardCardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: 0 }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both', px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 } }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            Quarterly Spend Forecast
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
            Projected actuals vs expected runway
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4, width: '100%' }}>
          {kpis.map((kpi: any, idx: number) => (
            <Card key={idx} sx={{ ...standardCardSx, width: '100%', borderTop: `3px solid ${ACCENT_BLUE}` }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 1 }}>
                  {kpi.label}
                </Typography>
                <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D2E', fontVariantNumeric: 'tabular-nums' }}>
                  {kpi.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

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

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ButtonGroup size="small" variant="outlined" sx={{ '& .MuiButton-root': { textTransform: 'none' } }}>
                <Button onClick={() => setScenario('conservative')} variant={scenario === 'conservative' ? 'contained' : 'outlined'}>Conservative (+10%)</Button>
                <Button onClick={() => setScenario('expected')} variant={scenario === 'expected' ? 'contained' : 'outlined'}>Expected (+18%)</Button>
                <Button onClick={() => setScenario('aggressive')} variant={scenario === 'aggressive' ? 'contained' : 'outlined'}>Aggressive (+30%)</Button>
              </ButtonGroup>
            </Box>

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
