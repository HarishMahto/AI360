import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, Stack, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRecommendations } from '../../api/hooks';

const mockRecommendations = [
  {
    id: 1,
    title: 'Optimize Context Windows',
    description: 'The Engineering team is consistently maxing out context windows. Recommending a switch to an optimized summarization model for code reviews to save 15% on token costs.',
    impact: 'High Impact',
    team: 'Engineering',
  },
  {
    id: 2,
    title: 'Underutilized Licenses',
    description: 'There are 12 allocated AI licenses in the Marketing department that have not been active in the last 30 days. Consider reallocating these to reduce fixed costs.',
    impact: 'Medium Impact',
    team: 'Marketing',
  },
  {
    id: 3,
    title: 'Prompt Engineering Training',
    description: 'High rate of repeated queries in the Support team. A 1-hour prompt engineering workshop could improve first-response accuracy and reduce redundant API calls.',
    impact: 'High Impact',
    team: 'Support',
  },
];

export default function Recommendations() {
  const { data, isLoading } = useRecommendations();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: '#1F5AA6' }} />
      </Box>
    );
  }

  const recommendationsList = data?.recommendations || mockRecommendations;

  const cardSx = { borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } };
  const sectionTitleSx = { fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' };

  return (
    <Box className="page-enter" sx={{ p: 0, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(31,90,166,0.03) 100%)', borderRadius: '12px', p: 2.5, mb: 3, border: '1px solid rgba(31,90,166,0.09)' }}>
          <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>
            Efficiency Recommendations
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>
            AI-driven insights to improve adoption, reduce costs, and maximize productivity across your teams.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {recommendationsList.map((rec: any, index: number) => (
          <Box key={rec.id} sx={{ width: '100%' }}>
            <Card sx={{ 
              ...cardSx,
              width: '100%',
              display: 'flex', 
              overflow: 'hidden',
              animation: 'fadeUp 0.4s ease both',
              animationDelay: `${index * 0.1}s`
            }}>
              <Box sx={{ width: 4, bgcolor: rec.impact === 'High Impact' ? '#DC2626' : '#D97706' }} />
              <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography sx={sectionTitleSx}>{rec.title}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5, maxWidth: '80%' }}>
                      {rec.description}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={rec.team} size="small" sx={{ height: 22, fontSize: '10px', fontWeight: 700, borderRadius: '5px', bgcolor: '#F0F4F8', color: '#4B5563' }} />
                    <Chip 
                      label={rec.impact} 
                      size="small" 
                      sx={{ 
                        height: 22, 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        borderRadius: '5px', 
                        bgcolor: rec.impact === 'High Impact' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)', 
                        color: rec.impact === 'High Impact' ? '#DC2626' : '#D97706'
                      }} 
                    />
                  </Stack>
                </Box>
                <Box mt={2}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="small"
                    disableElevation
                    startIcon={<CheckCircleIcon fontSize="small" />} 
                    sx={{ textTransform: 'none', fontWeight: 500, borderRadius: '6px', bgcolor: '#1F5AA6', '&:hover': { bgcolor: '#15417A' } }}
                  >
                    Apply Recommendation
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
        </Box>
      </Box>
    </Box>
  );
}
