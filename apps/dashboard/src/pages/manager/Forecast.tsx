import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Chip, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useForecast, useOLSRegression } from '../../api/hooks';

export default function Forecast() {
  const { data, isLoading } = useForecast({ period: '30d' });
  const olsEngineResult = useOLSRegression([1200, 1450, 1580, 1720, 1890, 2100]).data!;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: '#0066CC' }} />
      </Box>
    );
  }

  const chartPoints = olsEngineResult.forecastPoints.map(p => ({
    name: p.dayOrMonth,
    ActualCost: p.historicalCost || null,
    ProjectedCost: p.projectedCost || p.historicalCost,
  }));

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto', bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
          Section 11.3: FinOps OLS Cost & Usage Forecast
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
          Predictive analytics on usage and spend using OLS regression.
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>
                  Ordinary Least Squares (OLS) Linear Regression Model
                </Typography>
                <Chip 
                  label="Roadmap Upgrade: ARIMA & Prophet Scheduled" 
                  size="small" 
                  sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: 'rgba(255,149,0,0.10)', color: '#9E5B00' }} 
                />
              </Stack>
              
              <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mb: 3 }}>
                {olsEngineResult.roadmapNote}
              </Typography>

              <Box sx={{ height: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartPoints} margin={{ top: 20, right: 0, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                      formatter={(value: number) => [`$${value}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="ActualCost" stroke="#0066CC" strokeWidth={3} name="Historical Spend ($)" dot={{ r: 4, fill: '#0066CC', strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="ProjectedCost" stroke="#FF9500" strokeWidth={2} strokeDasharray="5 5" name="OLS Projected Spend ($)" dot={{ r: 3, fill: '#FF9500', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
