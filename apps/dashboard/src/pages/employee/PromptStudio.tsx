import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, Chip, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Alert
} from '@mui/material';
import { useScorePrompt, useOptimizePrompt, usePromptPrivacy } from '../../api/hooks';
import { analyzePrompt, type PromptAnalysisResult } from '../../engines/promptEngine';

const BRAND_COLOR = '#1F5AA6';

export default function PromptStudio() {
  const [prompt, setPrompt] = useState('Write Java API');
  const [analysisResult, setAnalysisResult] = useState<PromptAnalysisResult>(() => analyzePrompt('Write Java API'));

  const scoreMutation = useScorePrompt();
  const optimizeMutation = useOptimizePrompt();
  const privacyMutation = usePromptPrivacy();

  const handleScoreAndCoach = () => {
    const result = analyzePrompt(prompt);
    setAnalysisResult(result);

    privacyMutation.mutate(
      { prompt },
      {
        onSuccess: (backendPrivacy: any) => {
          if (backendPrivacy) {
            setAnalysisResult((prev) => ({
              ...prev,
              privacyAnalysis: {
                containsSensitiveData: backendPrivacy.contains_sensitive_data,
                detectedTypes: backendPrivacy.detected_types || [],
                maskedPrompt: backendPrivacy.masked_prompt || prev.privacyAnalysis.maskedPrompt,
                warningMessage: backendPrivacy.warning_message || prev.privacyAnalysis.warningMessage,
              },
            }));
          }
        },
      }
    );

    scoreMutation.mutate(prompt, {
      onError: () => {}
    });
  };

  const handleApplyOptimization = () => {
    setPrompt(analysisResult.optimizedPrompt);
    setAnalysisResult(analyzePrompt(analysisResult.optimizedPrompt));
  };

  const { qualityScore, dimensions, privacyAnalysis, metadataOnly } = analysisResult;

  return (
    <Box className="page-enter page-content" sx={{ p: { xs: 1, md: 1.5 }, width: '100%', minHeight: '100vh', bgcolor: '#F4F6FA' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(31,90,166,0.05) 0%, rgba(5,150,105,0.03) 100%)', borderRadius: 3, p: 3, mb: 3, border: '1px solid rgba(31,90,166,0.09)' }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1A1D2E' }}>Prompt Studio</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mt: 0.5 }}>Powered by 5-dimension rubric scoring</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Draft Editor</Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" sx={{ borderColor: 'rgba(31,90,166,0.09)', color: '#1A1D2E' }} onClick={() => setPrompt('')}>Clear</Button>
                <Button variant="contained" sx={{ bgcolor: BRAND_COLOR }} onClick={handleScoreAndCoach}>Analyze</Button>
              </Box>

              {privacyAnalysis.containsSensitiveData && (
                <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{privacyAnalysis.warningMessage}</Typography>
                </Alert>
              )}

              <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#F0F4F8', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E', mb: 1 }}>Feedback</Typography>
                {analysisResult.coachingFeedback.map((fb, idx) => (
                  <Typography key={idx} sx={{ fontSize: '0.8125rem', color: '#4B5563', mb: 0.5 }}>• {fb}</Typography>
                ))}
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E', mt: 2, mb: 1 }}>Optimized</Typography>
                <Typography sx={{ fontSize: '0.8125rem', p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid rgba(31,90,166,0.09)', mb: 2 }}>
                  {analysisResult.optimizedPrompt}
                </Typography>
                <Button variant="contained" size="small" onClick={handleApplyOptimization} sx={{ bgcolor: BRAND_COLOR }}>Use Optimized</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em', mb: 2 }}>Details</Typography>
                <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(31,90,166,0.09)' }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Tokens</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{metadataOnly.tokenCount}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Task</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{analysisResult.classification}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: '#F0F4F8' }}><TableCell sx={{ fontSize: '0.8125rem' }}>Recommend</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: BRAND_COLOR }}>{metadataOnly.recommendedModel}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'all 0.22s ease', '&:hover': { boxShadow: '0 6px 24px rgba(31,90,166,0.10)', borderColor: 'rgba(31,90,166,0.16)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' }}>Quality Score</Typography>
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: BRAND_COLOR }}>{qualityScore}</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {[
                    { label: 'Clarity', score: Math.round((dimensions.clarity / 20) * 100) },
                    { label: 'Context', score: Math.round((dimensions.context / 20) * 100) },
                    { label: 'Specificity', score: Math.round((dimensions.specificity / 20) * 100) },
                    { label: 'Format', score: Math.round((dimensions.format / 20) * 100) },
                    { label: 'Examples', score: Math.round((dimensions.examples / 20) * 100) }
                  ].map((item, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E' }}>{item.score}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={item.score} sx={{ height: 4, borderRadius: 2, bgcolor: '#F0F4F8', '& .MuiLinearProgress-bar': { bgcolor: BRAND_COLOR } }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
