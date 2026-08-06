import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, IconButton, Divider, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ACCENT_BLUE = '#1F5AA6';
const DANGER_RED = '#DC2626';

const mockReports = [
  { id: 1, title: 'Q2 2026 Board Summary', date: 'Jul 15, 2026', type: 'PDF' },
  { id: 2, title: 'AI Adoption & ROI Analysis', date: 'Jul 01, 2026', type: 'PDF' },
  { id: 3, title: 'Cost Optimization Suggestions', date: 'Jun 28, 2026', type: 'PDF' },
  { id: 4, title: 'Department Efficiency Deep Dive', date: 'Jun 15, 2026', type: 'PDF' },
];

export default function Reports() {
  const standardCardSx = { 
    borderRadius: '12px', 
    border: '1px solid rgba(31,90,166,0.09)', 
    boxShadow: '0 1px 4px rgba(31,90,166,0.05)', 
    bgcolor: '#FFFFFF', 
    transition: 'all 0.22s ease', 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%',
    '&:hover': { 
      boxShadow: '0 6px 24px rgba(31,90,166,0.10)', 
      borderColor: 'rgba(31,90,166,0.16)' 
    } 
  };

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', p: 0 }}>
      <Box sx={{ width: '100%', animation: 'fadeUp 0.4s ease both', px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
              Executive Reports
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
              Exportable board-ready PDF & CSV summaries
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<PictureAsPdfIcon fontSize="small" />}
            sx={{ 
              bgcolor: ACCENT_BLUE, 
              '&:hover': { bgcolor: '#16437E' },
              textTransform: 'none',
              borderRadius: '12px',
              px: 3,
              fontWeight: 600
            }}
          >
            Generate New
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, width: '100%' }}>
          {mockReports.map((report) => (
            <Box key={report.id} sx={{ width: '100%' }}>
              <Card sx={standardCardSx}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: '#F0F4F8', borderRadius: '12px', mr: 2 }}>
                      <PictureAsPdfIcon sx={{ color: DANGER_RED, fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', lineHeight: 1.2, mb: 0.5 }}>
                        {report.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>
                        Generated on {report.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 2 }}>
                    Automatically compiled summary containing key metrics, department leaderboards, and financial projections.
                  </Typography>
                </CardContent>
                <Divider sx={{ borderColor: 'rgba(31,90,166,0.09)' }} />
                <Box sx={{ px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F4F6FA' }}>
                  <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF' }}>
                    {report.type} FORMAT
                  </Typography>
                  <IconButton size="small" sx={{ color: ACCENT_BLUE }}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
}
