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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#FAFAFA' }}>
        <CircularProgress sx={{ color: '#0066CC' }} />
      </Box>
    );
  }

  const recommendationsList = data?.recommendations || mockRecommendations;

  return (
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto', bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
          Efficiency Recommendations
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
          AI-driven insights to improve adoption, reduce costs, and maximize productivity across your teams.
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {recommendationsList.map((rec: any, index: number) => (
          <Grid item xs={12} key={rec.id}>
            <Card sx={{ 
              borderRadius: 3.5, 
              border: '1px solid rgba(0,0,0,0.08)', 
              boxShadow: 'none', 
              bgcolor: '#FFFFFF', 
              display: 'flex', 
              overflow: 'hidden',
              animation: 'fadeUp 0.4s ease both',
              animationDelay: `${index * 0.1}s`,
              transition: 'box-shadow 0.25s ease, border-color 0.25s ease', 
              '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } 
            }}>
              <Box sx={{ width: 4, bgcolor: rec.impact === 'High Impact' ? '#FF3B30' : '#FF9500' }} />
              <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>{rec.title}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5, maxWidth: '80%' }}>
                      {rec.description}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={rec.team} size="small" sx={{ height: 22, fontSize: '0.67rem', fontWeight: 600, borderRadius: 1.5, bgcolor: '#F5F5F7', color: '#6E6E73' }} />
                    <Chip 
                      label={rec.impact} 
                      size="small" 
                      sx={{ 
                        height: 22, 
                        fontSize: '0.67rem', 
                        fontWeight: 600, 
                        borderRadius: 1.5, 
                        bgcolor: rec.impact === 'High Impact' ? 'rgba(255,59,48,0.1)' : 'rgba(255,149,0,0.1)', 
                        color: rec.impact === 'High Impact' ? '#C41C13' : '#9E5B00'
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
                    sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 1.5 }}
                  >
                    Apply Recommendation
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
