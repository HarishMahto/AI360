import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Paper } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useExecutiveDashboard, useROICalculator } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';
const SUCCESS_GREEN = '#059669';
const DANGER_RED = '#DC2626';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
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

  const standardCardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };

  return (
    <Box className="page-enter page-content" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: { xs: 1, md: 1.5 } }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            AI FinOps & ROI
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
            Value = Hours × Cost | ROI = (Value - Cost) / Cost
          </Typography>
        </Box>

        <Card sx={{ ...standardCardSx, mb: 4 }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 0.5 }}>
              Live Formula
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1A1D2E', fontFamily: 'monospace' }}>
              {roiCalculated.formulaString}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {kpis.map((kpi: any, idx: number) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ ...standardCardSx, borderTop: `3px solid ${kpi.color}` }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 1 }}>
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

        <Card sx={standardCardSx}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 3 }}>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,90,166,0.09)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 6px 24px rgba(31,90,166,0.10)' }} />
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
