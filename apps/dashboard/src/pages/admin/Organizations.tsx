import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, CircularProgress, Card } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';

const MOCK_ORGS = [
  { id: 'org_1', name: 'Acme Corp', plan: 'Enterprise', users: 145, status: 'Active', created: '2025-01-15' },
  { id: 'org_2', name: 'Global Tech', plan: 'Pro', users: 42, status: 'Active', created: '2025-03-22' },
  { id: 'org_3', name: 'Startup Inc', plan: 'Free', users: 8, status: 'Suspended', created: '2025-06-10' },
  { id: 'org_4', name: 'Mega Financial', plan: 'Enterprise', users: 890, status: 'Active', created: '2024-11-05' },
  { id: 'org_5', name: 'Design Studio', plan: 'Pro', users: 15, status: 'Active', created: '2026-02-18' },
];

export default function Organizations() {
  const { isPending } = useAdminDashboard();

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  return (
    <Box className="page-enter" sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
              Organizations
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
              Manage enterprise tenants and allocations
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<AddIcon fontSize="small" />}
            sx={{ 
              bgcolor: ACCENT_BLUE, 
              '&:hover': { bgcolor: '#0055AA' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Add Organization
          </Button>
        </Box>

        <TableContainer component={Card} sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5, px: 3 }}>Organization</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Plan</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Users</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Created Date</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.5, px: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_ORGS.map((org) => (
                <TableRow key={org.id} sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>{org.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{org.id}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Chip label={org.plan} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: '#F5F5F7', color: '#1D1D1F' }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{org.users}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem', color: '#6E6E73', py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{org.created}</TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Chip label={org.status} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: org.status === 'Active' ? 'rgba(52,199,89,0.10)' : 'rgba(255,59,48,0.1)', color: org.status === 'Active' ? '#1A7F37' : '#FF3B30' }} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <IconButton size="small" sx={{ color: '#6E6E73' }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#FF3B30' }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Box>
  );
}
