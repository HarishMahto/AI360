import React, { useState } from 'react';
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
  const [appliedRecs, setAppliedRecs] = useState<Record<string, boolean>>({});

  const handleApply = (id: string) => {
    setAppliedRecs(prev => ({ ...prev, [id]: true }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F4F6FA' }}>
        <CircularProgress sx={{ color: '#1F5AA6' }} />
      </Box>
    );
  }

  const recommendationsList = data?.recommendations || mockRecommendations;

  const cardSx = { borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF' };
  const sectionTitleSx = { fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#201F2E' };

  return (
    <Box className="page-enter" sx={{ p: 0, width: '100%', bgcolor: '#F4F6FA', minHeight: '100vh' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        <Box sx={{ background: '#FFFFFF', borderRadius: '22px', p: 3, mb: 3, border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)' }}>
          <Typography variant="h4" sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E' }}>
            Efficiency Recommendations
          </Typography>
          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#85839A', mt: 0.5 }}>
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
              <Box sx={{ width: 4, bgcolor: rec.impact === 'High Impact' ? '#E53E3E' : '#E8A23D' }} />
              <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography sx={sectionTitleSx}>{rec.title}</Typography>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', mt: 0.5, maxWidth: '80%' }}>
                      {rec.description}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={rec.team} size="small" sx={{ fontFamily: 'Inter, sans-serif', height: 22, fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', bgcolor: '#F5F4FB', color: '#85839A' }} />
                    <Chip 
                      label={rec.impact} 
                      size="small" 
                      sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        height: 22, 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        borderRadius: '6px', 
                        bgcolor: rec.impact === 'High Impact' ? '#FDF0F0' : '#FDF7EC', 
                        color: rec.impact === 'High Impact' ? '#E53E3E' : '#E8A23D'
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
                    sx={{ fontFamily: 'Inter, sans-serif', textTransform: 'none', fontWeight: 600, borderRadius: '8px', bgcolor: appliedRecs[rec.id] ? '#1FAE7A' : '#5B57F0', '&:hover': { bgcolor: appliedRecs[rec.id] ? '#159664' : '#4945C9' } }}
                    onClick={() => handleApply(rec.id)}
                  >
                    {appliedRecs[rec.id] ? 'Applied' : 'Apply Recommendation'}
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
