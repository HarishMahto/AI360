import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, IconButton, Divider, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ACCENT_BLUE = '#0066CC';

const mockReports = [
  { id: 1, title: 'Q2 2026 Board Summary', date: 'Jul 15, 2026', type: 'PDF' },
  { id: 2, title: 'AI Adoption & ROI Analysis', date: 'Jul 01, 2026', type: 'PDF' },
  { id: 3, title: 'Cost Optimization Suggestions', date: 'Jun 28, 2026', type: 'PDF' },
  { id: 4, title: 'Department Efficiency Deep Dive', date: 'Jun 15, 2026', type: 'PDF' },
];

export default function Reports() {
  return (
    <Box className="page-enter" sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto', animation: 'fadeUp 0.4s ease both' }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
              Board-Ready Reports
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
              Automatically compiled documents and insights
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<AutoAwesomeIcon fontSize="small" />}
            sx={{ 
              bgcolor: ACCENT_BLUE, 
              '&:hover': { bgcolor: '#0055AA' },
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Generate New
          </Button>
        </Box>

        <Grid container spacing={3}>
          {mockReports.map((report) => (
            <Grid item xs={12} md={6} lg={4} key={report.id}>
              <Card sx={{ 
                borderRadius: 3.5, 
                border: '1px solid rgba(0,0,0,0.08)', 
                boxShadow: 'none', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' }
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: '#F5F5F7', borderRadius: 2, mr: 2 }}>
                      <PictureAsPdfIcon sx={{ color: '#FF3B30', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', lineHeight: 1.2, mb: 0.5 }}>
                        {report.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>
                        Generated on {report.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 2 }}>
                    Automatically compiled summary containing key metrics, department leaderboards, and financial projections.
                  </Typography>
                </CardContent>
                <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                <Box sx={{ px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFAFA' }}>
                  <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', color: '#6E6E73' }}>
                    {report.type} FORMAT
                  </Typography>
                  <IconButton size="small" sx={{ color: ACCENT_BLUE }}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Box>
    </Box>
  );
}
