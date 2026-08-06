import React from 'react';
import { Box, Typography, Grid, TextField, Switch, Button, Divider, CircularProgress, Card, CardContent } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAdminDashboard } from '../../api/hooks';

const ACCENT_BLUE = '#0066CC';

const MOCK_PROVIDERS = [
  { id: 'openai', name: 'OpenAI Gateway', key: 'sk-proj-.......................', enabled: true, model: 'gpt-4o' },
  { id: 'anthropic', name: 'Anthropic Claude Engine', key: 'sk-ant-.......................', enabled: true, model: 'claude-3-5-sonnet' },
  { id: 'google', name: 'Google Gemini Gateway', key: 'AIzaSy.......................', enabled: true, model: 'gemini-1.5-flash' },
];

export default function Providers() {
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
        
        <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(37,99,235,0.07)' }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
            AI Providers & Gateway
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
            Manage API keys and default model routing
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {MOCK_PROVIDERS.map((provider) => (
            <Grid item xs={12} md={6} key={provider.id}>
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>
                      {provider.name}
                    </Typography>
                    <Switch size="small" defaultChecked={provider.enabled} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT_BLUE }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: ACCENT_BLUE } }} />
                  </Box>
                  <Divider sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.06)' }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>API Key</Typography>
                      <TextField type="password" defaultValue={provider.key} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>Default Model Target</Typography>
                      <TextField defaultValue={provider.model} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<SaveIcon fontSize="small" />}
                      sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#1D1D1F', textTransform: 'none', borderRadius: 2, mt: 1, '&:hover': { borderColor: 'rgba(0,0,0,0.2)', bgcolor: '#F5F5F7' } }}
                    >
                      Save Configuration
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Box>
    </Box>
  );
}
