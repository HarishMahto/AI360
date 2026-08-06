import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, CircularProgress, Card } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  return (
    <Box className="page-enter page-content" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: { xs: 1, md: 1.5 } }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
              Organizations
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', mt: 0.5 }}>
              Manage enterprise tenants and allocations
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<AddIcon fontSize="small" />}
            sx={{ 
              bgcolor: ACCENT_BLUE, 
              '&:hover': { bgcolor: '#1a4b8c' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Add Organization
          </Button>
        </Box>

        <TableContainer component={Card} sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5, px: 3 }}>Organization</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Plan</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Users</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Created Date</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5, px: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_ORGS.map((org) => (
                <TableRow key={org.id} sx={{ '&:hover': { bgcolor: '#F0F4F8' }, '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E' }}>{org.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>{org.id}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                    <Chip label={org.plan} size="small" sx={{ height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '6px', bgcolor: '#F0F4F8', color: '#1A1D2E' }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>{org.users}</TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem', color: '#4B5563', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>{org.created}</TableCell>
                  <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                    <Chip label={org.status} size="small" sx={{ height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '6px', bgcolor: org.status === 'Active' ? 'rgba(5,150,105,0.10)' : 'rgba(220,38,38,0.1)', color: org.status === 'Active' ? '#059669' : '#DC2626' }} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                    <IconButton size="small" sx={{ color: '#4B5563' }}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#DC2626' }}><DeleteIcon fontSize="small" /></IconButton>
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
