import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Switch, FormControlLabel, Button, Divider, TextField, Slider, CircularProgress } from '@mui/material';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';

export default function Settings() {
  const { isPending } = useAdminDashboard();

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: 0 }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both', px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
              System Settings
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', mt: 0.5 }}>
              Global platform controls and security policies
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            sx={{ 
              bgcolor: ACCENT_BLUE, 
              '&:hover': { bgcolor: '#1a4b8c' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Save Configuration
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
          <Box sx={{ width: '100%' }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', borderTop: '3px solid #1F5AA6', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, height: '100%' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>
                  Security & Access
                </Typography>
                <Divider sx={{ mb: 3, borderColor: 'rgba(31,90,166,0.09)' }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel 
                    control={<Switch size="small" defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>Enforce 2FA Globally</Typography>}
                  />
                  <FormControlLabel 
                    control={<Switch size="small" defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>Single Sign-On (SSO) Strict Mode</Typography>}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E', mb: 1 }}>Session Timeout (Minutes)</Typography>
                    <Slider
                      defaultValue={30}
                      step={5}
                      marks
                      min={10}
                      max={120}
                      valueLabelDisplay="auto"
                      sx={{ color: ACCENT_BLUE }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', borderTop: '3px solid #1F5AA6', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, height: '100%' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>
                  Data Privacy & Masking
                </Typography>
                <Divider sx={{ mb: 3, borderColor: 'rgba(31,90,166,0.09)' }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel 
                    control={<Switch size="small" defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>Auto-redact PII in Prompts</Typography>}
                  />
                  <FormControlLabel 
                    control={<Switch size="small" defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>Block Credit Cards & SSNs</Typography>}
                  />
                  <FormControlLabel 
                    control={<Switch size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>Store Prompt History</Typography>}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E', mb: 1 }}>Allowed Domains (Comma separated)</Typography>
                    <TextField 
                      fullWidth 
                      variant="outlined" 
                      size="small" 
                      defaultValue="acmecorp.com, startup.io" 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8125rem' } }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
