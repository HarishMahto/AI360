import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Divider, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Stack } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import { api } from '../../api/client';

const reportsList = [
  { id: 1, title: 'Monthly Executive Summary', type: 'PDF', date: 'Jul 01, 2026' },
  { id: 2, title: 'Team Usage Metrics Q2', type: 'CSV', date: 'Jun 30, 2026' },
  { id: 3, title: 'Cost Analysis & Chargebacks', type: 'PDF', date: 'Jun 15, 2026' },
  { id: 4, title: 'Security & Compliance Log', type: 'CSV', date: 'May 31, 2026' },
];

export default function Reports() {

  const handleDownload = async (type: string, format: string) => {
    try {
      const response = await api.downloadReport(type, format);
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download report', error);
    }
  };

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto', bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
          Reports & Exports
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
          Generate and download custom compliance, cost, and usage reports.
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' }, mb: 3 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>Generate New Report</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mb: 3 }}>
                Create a customized report based on current data.
              </Typography>
              
              <Stack spacing={1.5}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  color="primary"
                  disableElevation
                  sx={{ py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                  startIcon={<PictureAsPdfIcon fontSize="small" />}
                  onClick={() => handleDownload('executive', 'pdf')}
                >
                  Executive PDF
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ py: 1, borderRadius: 2, textTransform: 'none', fontWeight: 500, borderColor: 'rgba(0,0,0,0.12)', color: '#1D1D1F', '&:hover': { borderColor: 'rgba(0,0,0,0.2)', bgcolor: '#F5F5F7' } }} 
                  startIcon={<AssessmentIcon fontSize="small" />}
                  onClick={() => handleDownload('raw-data', 'csv')}
                >
                  Raw CSV Data
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Recent Reports</Typography>
              </Box>
              <List disablePadding>
                {reportsList.map((report, index) => (
                  <React.Fragment key={report.id}>
                    <ListItem sx={{ py: 2, px: 2.5, '&:hover': { bgcolor: '#F5F5F7' } }}>
                      <ListItemIcon>
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {report.type === 'PDF' ? <PictureAsPdfIcon sx={{ fontSize: 20, color: '#FF3B30' }} /> : <AssessmentIcon sx={{ fontSize: 20, color: '#34C759' }} />}
                        </Box>
                      </ListItemIcon>
                      <ListItemText 
                        primary={report.title} 
                        secondary={`Generated on ${report.date}`} 
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500, color: '#1D1D1F' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.25 }}
                      />
                      <ListItemSecondaryAction sx={{ right: 20 }}>
                        <Button 
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />} 
                          sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#1D1D1F', textTransform: 'none', fontWeight: 500, borderRadius: 1.5, py: 0.5, '&:hover': { borderColor: 'rgba(0,0,0,0.2)', bgcolor: '#F5F5F7' } }}
                          onClick={() => handleDownload(report.title.toLowerCase().replace(/ /g, '-'), report.type.toLowerCase())}
                        >
                          Download
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < reportsList.length - 1 && <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
