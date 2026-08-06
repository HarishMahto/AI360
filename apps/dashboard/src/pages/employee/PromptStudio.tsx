import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, Chip, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Alert
} from '@mui/material';
import { useScorePrompt, useOptimizePrompt, usePromptPrivacy } from '../../api/hooks';
import { analyzePrompt, type PromptAnalysisResult } from '../../engines/promptEngine';

const BRAND_COLOR = '#0066CC';

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
    <Box className="page-enter" sx={{ p: { xs: 2, md: 3 }, width: '100%', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <Box sx={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: 3, p: 3, mb: 3, border: '1px solid rgba(37,99,235,0.07)' }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>Prompt Studio</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>Powered by 5-dimension rubric scoring</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Draft Editor</Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" sx={{ borderColor: 'rgba(0,0,0,0.12)', color: '#1D1D1F' }} onClick={() => setPrompt('')}>Clear</Button>
                <Button variant="contained" sx={{ bgcolor: BRAND_COLOR }} onClick={handleScoreAndCoach}>Analyze</Button>
              </Box>

              {privacyAnalysis.containsSensitiveData && (
                <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{privacyAnalysis.warningMessage}</Typography>
                </Alert>
              )}

              <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: '#F5F5F7', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F', mb: 1 }}>Feedback</Typography>
                {analysisResult.coachingFeedback.map((fb, idx) => (
                  <Typography key={idx} sx={{ fontSize: '0.8125rem', color: '#6E6E73', mb: 0.5 }}>• {fb}</Typography>
                ))}
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F', mt: 2, mb: 1 }}>Optimized</Typography>
                <Typography sx={{ fontSize: '0.8125rem', p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', mb: 2 }}>
                  {analysisResult.optimizedPrompt}
                </Typography>
                <Button variant="contained" size="small" onClick={handleApplyOptimization} sx={{ bgcolor: BRAND_COLOR }}>Use Optimized</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Details</Typography>
                <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Tokens</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{metadataOnly.tokenCount}</TableCell></TableRow>
                      <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Task</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{analysisResult.classification}</TableCell></TableRow>
                      <TableRow sx={{ bgcolor: '#F5F5F7' }}><TableCell sx={{ fontSize: '0.8125rem' }}>Recommend</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: BRAND_COLOR }}>{metadataOnly.recommendedModel}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>Quality Score</Typography>
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
                        <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F' }}>{item.score}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={item.score} sx={{ height: 4, borderRadius: 2, bgcolor: '#F5F5F7', '& .MuiLinearProgress-bar': { bgcolor: BRAND_COLOR } }} />
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
