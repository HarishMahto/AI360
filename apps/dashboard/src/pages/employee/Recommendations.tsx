import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack
} from '@mui/material';
import { useSmartSuggestions } from '../../api/hooks';

const BRAND_COLOR = '#0066CC';

export default function Recommendations() {
  const smart = useSmartSuggestions('Engineering').data!;

  const recommendationsTable = [
    { signal: 'Summarization', recommendation: 'Gemini Flash', savings: '78% cheaper', color: '#34C759' },
    { signal: 'GPT-5 (general use)', recommendation: 'Gemini Flash', savings: '40% cheaper', color: '#34C759' },
    { signal: 'Java REST API', recommendation: 'Claude 3.5 Sonnet', savings: '42% lower cost', color: BRAND_COLOR }
  ];

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>Recommendations</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Model routing and prompt improvements</Typography>
      </Box>

      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Routing Suggestions</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {recommendationsTable.map((row, idx) => (
          <Grid item xs={12} md={4} key={idx} sx={{ animation: 'fadeUp 0.4s ease both', animationDelay: `${idx * 0.1}s` }}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', bgcolor: '#FFFFFF', borderLeft: `3px solid ${row.color}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1 }}>{row.signal}</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>{row.recommendation}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: row.color, fontWeight: 500, mb: 2 }}>{row.savings}</Typography>
                <Button variant="contained" size="small" sx={{ bgcolor: BRAND_COLOR, mt: 'auto', alignSelf: 'flex-start' }}>Apply</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Improvements</Typography>
            <Stack spacing={1.5}>
              {smart.promptImprovements.map((tip, idx) => (
                <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F5F5F7' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F' }}>{tip}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Cost Reduction</Typography>
            <Stack spacing={1.5}>
              {smart.costReductionTips.map((tip, idx) => (
                <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F5F5F7' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F' }}>{tip}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
