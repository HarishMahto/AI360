import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Chip, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useForecast, useOLSRegression } from '../../api/hooks';

export default function Forecast() {
  const { data, isLoading: forecastLoading } = useForecast({ period: '30d' });
  const { data: olsData, isLoading: olsLoading, isError } = useOLSRegression([1200, 1450, 1580, 1720, 1890, 2100]);

  if (forecastLoading || olsLoading || !olsData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        {isError ? <Typography color="error">Error loading forecast data.</Typography> : <CircularProgress sx={{ color: '#1F5AA6' }} />}
      </Box>
    );
  }

  const olsEngineResult = olsData;

  const chartPoints = olsEngineResult.forecastPoints.map((p, i) => ({
    name: p.dayOrMonth,
    'Historical Actuals': p.historicalCost ?? null,
    'OLS Trend': p.historicalCost != null ? Math.round(olsEngineResult.slope * (i + 1) + olsEngineResult.intercept) : null,
    'OLS Forecast': p.projectedCost ?? null,
  }));

  const cardSx = { borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' };
  const sectionTitleSx = { fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' };

  return (
    <Box className="page-enter" sx={{ p: 0, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        <Box sx={{ background: '#FFFFFF', borderRadius: '22px', p: 3, mb: 3, border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)' }}>
          <Typography variant="h4" sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
            Section 11.3: FinOps OLS Cost & Usage Forecast
          </Typography>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#85839A', mt: 0.5 }}>
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
                  sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#FCF0DE', color: '#E8A23D' }} 
                />
              </Stack>
              
              <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#85839A', mb: 3 }}>
                {olsEngineResult.roadmapNote}
              </Typography>

              <Box sx={{ height: 380, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints} margin={{ top: 20, right: 0, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E7F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#85839A' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12, fill: '#85839A' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E9E7F5', boxShadow: '0 4px 16px rgba(32, 31, 46, 0.08)' }}
                      formatter={(value: number) => [`$${value}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: '#85839A' }} />
                    <Line type="monotone" dataKey="Historical Actuals" stroke="#5B57F0" strokeWidth={3} dot={{ r: 4 }} name="Historical Actuals ($)" />
                    <Line type="monotone" dataKey="OLS Trend" stroke="#1FAE7A" strokeWidth={2} strokeDasharray="5 5" dot={false} name="OLS Line of Best Fit ($)" />
                    <Line type="monotone" dataKey="OLS Forecast" stroke="#E8A23D" strokeWidth={3} strokeDasharray="3 3" dot={{ r: 5 }} name="OLS Projected Runway ($)" />
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
