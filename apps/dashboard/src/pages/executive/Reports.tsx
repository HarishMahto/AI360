import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, IconButton, Divider, CircularProgress, Snackbar, Alert } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { api } from '../../api/client';
import { useReportsList } from '../../api/hooks';

const ACCENT_BLUE = '#1F5AA6';
const DANGER_RED = '#DC2626';

export default function Reports() {
  const { data: reportsData, isLoading } = useReportsList('executive');
  const reports = reportsData || [];
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleDownload = async (type: string, format: string) => {
    try {
      const response = await api.downloadReport(type, format);
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setSnack({ open: true, message: `Report downloaded successfully.`, severity: 'success' });
    } catch (e: any) {
      setSnack({ open: true, message: `Failed to download report: ${e.message}`, severity: 'error' });
    }
  };

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
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
            onClick={() => handleDownload('executive', 'pdf')}
          >
            Generate New
          </Button>
        </Box>

        {reports.length === 0 ? (
          <Card sx={{ ...standardCardSx, alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ p: 2, bgcolor: '#F0F4F8', borderRadius: '50%', display: 'inline-flex', mb: 2 }}>
                <PictureAsPdfIcon sx={{ color: ACCENT_BLUE, fontSize: 32 }} />
              </Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', mb: 0.5 }}>
                No reports generated yet
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563' }}>
                Click "Generate New" above to compile your first board-ready summary.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, width: '100%' }}>
            {reports.map((report: any) => {
              const format = (report.format || 'pdf').toUpperCase();
              const generatedLabel = report.generated_at
                ? new Date(report.generated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : (report.date || '—');
              return (
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
                            Generated on {generatedLabel}
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
                        {format} FORMAT
                      </Typography>
                      <IconButton size="small" sx={{ color: ACCENT_BLUE }} onClick={() => handleDownload(report.type || 'executive', (report.format || 'pdf').toLowerCase())}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}

      </Box>
      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
