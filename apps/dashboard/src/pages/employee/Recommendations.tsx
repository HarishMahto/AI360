import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack
} from '@mui/material';
import { useSmartSuggestions } from '../../api/hooks';

const BRAND_COLOR = '#1F5AA6';

export default function Recommendations() {
  const smart = useSmartSuggestions('Engineering').data;

  const recommendationsTable = [
    { signal: 'Summarization', recommendation: 'Gemini Flash', savings: '78% cheaper', color: '#059669' },
    { signal: 'GPT-5 (general use)', recommendation: 'Gemini Flash', savings: '40% cheaper', color: '#059669' },
    { signal: 'Java REST API', recommendation: 'Claude 3.5 Sonnet', savings: '42% lower cost', color: BRAND_COLOR }
  ];

  return (
    <Box className="page-enter" sx={{ p: 0, width: '100%', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>Recommendations</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>Model routing and prompt improvements</Typography>
        </Box>

        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Routing Suggestions</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4, width: '100%' }}>
          {recommendationsTable.map((row, idx) => (
            <Card key={idx} sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, borderLeft: `3px solid ${row.color}`, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9CA3AF', mb: 1 }}>{row.signal}</Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>{row.recommendation}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: row.color, fontWeight: 500, mb: 2 }}>{row.savings}</Typography>
                <Button variant="contained" size="small" sx={{ bgcolor: BRAND_COLOR, mt: 'auto', alignSelf: 'flex-start' }}>Apply</Button>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
          <Card sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Improvements</Typography>
            <Stack spacing={1.5}>
              {(smart?.promptImprovements ?? []).map((tip, idx) => (
                <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F0F4F8' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>{tip}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' }, p: 3, height: '100%' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Cost Reduction</Typography>
            <Stack spacing={1.5}>
              {(smart?.costReductionTips ?? []).map((tip, idx) => (
                <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F0F4F8' }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>{tip}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
