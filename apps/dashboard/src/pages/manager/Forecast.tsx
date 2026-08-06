import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Chip, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useForecast, useOLSRegression } from '../../api/hooks';

export default function Forecast() {
  const { data, isLoading } = useForecast({ period: '30d' });
  const olsEngineResult = useOLSRegression([1200, 1450, 1580, 1720, 1890, 2100]).data!;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: '#1F5AA6' }} />
      </Box>
    );
  }

  const chartPoints = olsEngineResult.forecastPoints.map((p, i) => ({
    name: p.dayOrMonth,
    'Historical Actuals': p.historicalCost ?? null,
    'OLS Trend': p.historicalCost != null ? Math.round(olsEngineResult.slope * (i + 1) + olsEngineResult.intercept) : null,
    'OLS Forecast': p.projectedCost ?? null,
  }));

  const cardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };
  const sectionTitleSx = { fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' };

  return (
    <Box className="page-enter" sx={{ p: 0, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(31,90,166,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(31,90,166,0.09)' }}>
          <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            Section 11.3: FinOps OLS Cost & Usage Forecast
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
            Predictive analytics on usage and spend using OLS regression.
          </Typography>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <Card sx={{ ...cardSx, width: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                <Typography sx={sectionTitleSx}>
                  Ordinary Least Squares (OLS) Linear Regression Model
                </Typography>
                <Chip 
                  label="Roadmap Upgrade: ARIMA & Prophet Scheduled" 
                  size="small" 
                  sx={{ height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '5px', bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706' }} 
                />
              </Stack>
              
              <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mb: 3 }}>
                {olsEngineResult.roadmapNote}
              </Typography>

              <Box sx={{ height: 380, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints} margin={{ top: 20, right: 0, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,90,166,0.09)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12, fill: '#4B5563' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 4px 16px rgba(31,90,166,0.10)' }}
                      formatter={(value: number) => [`$${value}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: '#4B5563' }} />
                    <Line type="monotone" dataKey="Historical Actuals" stroke="#1F5AA6" strokeWidth={3} dot={{ r: 4 }} name="Historical Actuals ($)" />
                    <Line type="monotone" dataKey="OLS Trend" stroke="#059669" strokeWidth={2} strokeDasharray="5 5" dot={false} name="OLS Line of Best Fit ($)" />
                    <Line type="monotone" dataKey="OLS Forecast" stroke="#D97706" strokeWidth={3} strokeDasharray="3 3" dot={{ r: 5 }} name="OLS Projected Runway ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
