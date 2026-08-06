import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Switch, FormControlLabel, Button, Divider, TextField, Slider, CircularProgress } from '@mui/material';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';

export default function Settings() {
  const { isPending } = useAdminDashboard();

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F5F7FA' }}>
        <CircularProgress sx={{ color: ACCENT_BLUE }} />
      </Box>
    );
  }

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
              Platform Settings
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
              Configure global security, retention, and privacy
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            sx={{ 
              bgcolor: ACCENT_BLUE, 
              '&:hover': { bgcolor: '#0055AA' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Save Configuration
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderLeft: '4px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>
                  Security & Access
                </Typography>
                <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.06)' }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel 
                    control={<Switch size="small" defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F' }}>Enforce 2FA Globally</Typography>}
                  />
                  <FormControlLabel 
                    control={<Switch size="small" defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F' }}>Single Sign-On (SSO) Strict Mode</Typography>}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', mb: 1 }}>Session Timeout (Minutes)</Typography>
                    <Slider
                      defaultValue={30}
                      step={5}
                      marks
                      min={15}
                      max={120}
                      valueLabelDisplay="auto"
                      sx={{ color: ACCENT_BLUE }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', borderLeft: '4px solid #2563EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>
                  Data Privacy & PII
                </Typography>
                <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.06)' }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <FormControlLabel 
                      control={<Switch size="small" defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                      label={<Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F' }}>Enable Automatic PII Redaction</Typography>}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', ml: 3.5, mt: -0.5 }}>
                      Automatically masks emails, SSNs, and phone numbers in AI prompts.
                    </Typography>
                  </Box>

                  <FormControlLabel 
                    control={<Switch size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />} 
                    label={<Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F' }}>Store Prompt History</Typography>}
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', mb: 1 }}>Allowed Domains (Comma separated)</Typography>
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
          </Grid>
        </Grid>

      </Box>
    </Box>
  );
}
