import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useDepartmentAnalytics } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';
const SUCCESS_GREEN = '#34C759';
const WARNING_ORANGE = '#FF9500';
const DANGER_RED = '#FF3B30';

const defaultMockData = [
  { dept: 'Engineering', efficiency: 95, users: 120 },
  { dept: 'Marketing', efficiency: 88, users: 45 },
  { dept: 'Sales', efficiency: 82, users: 80 },
  { dept: 'HR', efficiency: 75, users: 20 },
  { dept: 'Support', efficiency: 91, users: 150 },
];

export default function DeptRankings() {
  const { data, isLoading } = useDepartmentAnalytics();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  const chartData = Array.isArray(data) ? data : data?.rankings || defaultMockData;
  const sortedData = [...chartData].sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
            Department Rankings
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
            Efficiency and adoption metrics across all departments
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', mb: 4 }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 3 }}>
              Efficiency Score by Department
            </Typography>
            <Box sx={{ height: 320, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                  <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,102,204,0.04)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="efficiency" name="Efficiency Score" fill={ACCENT_BLUE} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <TableContainer sx={{ minHeight: 400,  borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Rank</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Department</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Active Users</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Efficiency Score</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row: any, index: number) => {
                const eff = row.efficiency || 0;
                let statusChip = { label: 'Needs Focus', color: DANGER_RED, bg: 'rgba(255,59,48,0.1)' };
                if (eff >= 90) statusChip = { label: 'Excellent', color: SUCCESS_GREEN, bg: 'rgba(52,199,89,0.1)' };
                else if (eff >= 80) statusChip = { label: 'Good', color: WARNING_ORANGE, bg: 'rgba(255,149,0,0.1)' };

                return (
                  <TableRow key={row.dept || index} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: index < 3 ? '#1D1D1F' : '#AEAEB2' }}>{index + 1}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1D1D1F', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{row.dept}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{row.users || 0}</TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{eff}/100</TableCell>
                    <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <Chip 
                        label={statusChip.label}
                        size="small"
                        sx={{ 
                          height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5,
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
