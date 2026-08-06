import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useDepartmentAnalytics } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';
const SUCCESS_GREEN = '#059669';
const WARNING_ORANGE = '#D97706';
const DANGER_RED = '#DC2626';

const defaultMockData = [
  { dept: 'Engineering', efficiency: 95, users: 120, maturity: 'Stage 5 (Leader)' },
  { dept: 'Marketing', efficiency: 88, users: 45, maturity: 'Stage 4 (Advanced)' },
  { dept: 'Sales', efficiency: 82, users: 80, maturity: 'Stage 3 (Developing)' },
  { dept: 'HR', efficiency: 75, users: 20, maturity: 'Stage 3 (Developing)' },
  { dept: 'Support', efficiency: 91, users: 150, maturity: 'Stage 4 (Advanced)' },
];

export default function DeptRankings() {
  const { data, isLoading } = useDepartmentAnalytics();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  const chartData = Array.isArray(data) ? data : data?.rankings || defaultMockData;
  const sortedData = [...chartData].sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));

  const standardCardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };

  return (
    <Box className="page-enter page-content" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: { xs: 1, md: 1.5 } }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(5,150,105,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(31,90,166,0.09)' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            Department Rankings
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
            Efficiency and adoption metrics across all departments
          </Typography>
        </Box>

        <Card sx={{ ...standardCardSx, mb: 4 }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 3 }}>
              Efficiency Score by Department
            </Typography>
            <Box sx={{ height: 320, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(31,90,166,0.09)" />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} />
                  <Tooltip cursor={{ fill: 'rgba(31,90,166,0.04)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 6px 24px rgba(31,90,166,0.10)' }} />
                  <Bar dataKey="efficiency" name="Efficiency Score" fill={ACCENT_BLUE} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <TableContainer sx={{ minHeight: 400, ...standardCardSx }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Rank</TableCell>
                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Department</TableCell>
                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Active Users</TableCell>
                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Efficiency Score</TableCell>
                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Maturity Stage</TableCell>
                <TableCell sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row: any, index: number) => {
                const eff = row.efficiency || 0;
                let statusChip = { label: 'Needs Focus', color: DANGER_RED, bg: 'rgba(220,38,38,0.1)' };
                if (eff >= 90) statusChip = { label: 'Excellent', color: SUCCESS_GREEN, bg: 'rgba(5,150,105,0.1)' };
                else if (eff >= 80) statusChip = { label: 'Good', color: WARNING_ORANGE, bg: 'rgba(217,119,6,0.1)' };

                return (
                  <TableRow key={row.dept || index} sx={{ '&:hover': { bgcolor: '#F0F4F8' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: index < 3 ? '#1A1D2E' : '#9CA3AF' }}>{index + 1}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1A1D2E', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>{row.dept}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>{row.users || 0}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>{eff}/100</TableCell>
                    <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                      <Chip
                        label={row.maturity_stage ?? row.maturity ?? '—'}
                        size="small"
                        sx={{ height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '5px', bgcolor: '#F0F4F8', color: '#1A1D2E' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                      <Chip
                        label={statusChip.label}
                        size="small"
                        sx={{ 
                          height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '5px',
                          bgcolor: statusChip.bg,
                          color: statusChip.color
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Box>
  );
}
