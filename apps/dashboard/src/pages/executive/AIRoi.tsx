import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Paper } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useExecutiveDashboard, useROICalculator } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';
const SUCCESS_GREEN = '#34C759';
const DANGER_RED = '#FF3B30';

const defaultMockData = [
  { month: 'Jan', savings: 84000, cost: 20000 },
  { month: 'Feb', savings: 118000, cost: 28000 },
  { month: 'Mar', savings: 152000, cost: 35000 },
  { month: 'Apr', savings: 185000, cost: 42000 },
  { month: 'May', savings: 210000, cost: 48000 },
  { month: 'Jun', savings: 235000, cost: 52000 },
  { month: 'Jul', savings: 260000, cost: 55000 },
];

export default function AIRoi() {
  const { data, isLoading } = useExecutiveDashboard();
  const roiCalculated = useROICalculator(28500, 50, 280000).data!;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  const chartData = data?.roiTrend || defaultMockData;

  const kpis = [
    { label: 'Business Value Generated', value: `$${roiCalculated.businessValueGenerated.toLocaleString()}`, color: SUCCESS_GREEN },
    { label: 'Hours Saved Enterprise-Wide', value: `${roiCalculated.hoursSaved.toLocaleString()} hrs`, color: ACCENT_BLUE },
    { label: 'AI Cost Incurred', value: `$${roiCalculated.aiCostIncurred.toLocaleString()}`, color: DANGER_RED },
  ];

  return (
    <Box className="page-enter" sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
            AI FinOps & ROI
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
            Value = Hours × Cost | ROI = (Value - Cost) / Cost
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', mb: 4, bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 0.5 }}>
              Live Formula
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F', fontFamily: 'monospace' }}>
              {roiCalculated.formulaString}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {kpis.map((kpi: any, idx: number) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1 }}>
                    {kpi.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: kpi.color, fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none' }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 3 }}>
              Value Created ($1.425M) vs Total AI Spend ($280k)
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT_BLUE} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={ACCENT_BLUE} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DANGER_RED} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={DANGER_RED} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="savings" name="Value Generated" stroke={ACCENT_BLUE} strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                  <Area type="monotone" dataKey="cost" name="Cost" stroke={DANGER_RED} strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}
