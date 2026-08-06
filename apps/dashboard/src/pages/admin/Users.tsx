import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Button, Avatar, Switch, Paper, CircularProgress, Card } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';

const MOCK_USERS = [
  { id: 'u_1', name: 'Alice Smith', email: 'alice@acmecorp.com', role: 'ADMIN', org: 'Acme Corp', status: true },
  { id: 'u_2', name: 'Bob Johnson', email: 'bob@globaltech.com', role: 'MANAGER', org: 'Global Tech', status: true },
  { id: 'u_3', name: 'Charlie Brown', email: 'charlie@startup.io', role: 'EMPLOYEE', org: 'Startup Inc', status: false },
  { id: 'u_4', name: 'Diana Prince', email: 'diana@megafin.com', role: 'EXECUTIVE', org: 'Mega Financial', status: true },
  { id: 'u_5', name: 'Evan Davis', email: 'evan@design.net', role: 'EMPLOYEE', org: 'Design Studio', status: true },
];

const getRoleChip = (role: string) => {
  switch(role) {
    case 'ADMIN': return { bg: 'rgba(217,119,6,0.1)', color: '#D97706' };
    case 'MANAGER': return { bg: 'rgba(31,90,166,0.1)', color: ACCENT_BLUE };
    case 'EXECUTIVE': return { bg: 'rgba(123,44,191,0.1)', color: '#7B2CBF' };
    default: return { bg: '#F0F4F8', color: '#4B5563' };
  }
};

export default function Users() {
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
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(31,90,166,0.02) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(31,90,166,0.09)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
              Users & RBAC
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', mt: 0.5 }}>
              Manage platform users and active seat policies
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<PersonAddIcon fontSize="small" />}
            sx={{ 
              bgcolor: ACCENT_BLUE, 
              '&:hover': { bgcolor: '#1a4b8c' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Invite User
          </Button>
        </Box>

        <TableContainer component={Card} sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } }}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5, px: 3 }}>User</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Organization</TableCell>
                <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Role</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.09)', py: 1.5, px: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_USERS.map((user) => {
                const roleStyle = getRoleChip(user.role);
                return (
                  <TableRow key={user.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#FFFFFF' }, '&:hover': { bgcolor: '#F0F4F8' }, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(31,90,166,0.08)', color: ACCENT_BLUE, fontSize: '0.8125rem', fontWeight: 600 }}>{user.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E' }}>{user.name}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>{user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem', color: '#1A1D2E', py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>{user.org}</TableCell>
                    <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '6px',
                          bgcolor: roleStyle.bg,
                          color: roleStyle.color,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                      <Switch size="small" defaultChecked={user.status} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5, px: 3, borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
                      <IconButton size="small"><MoreVertIcon fontSize="small" sx={{ color: '#4B5563' }} /></IconButton>
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
