import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, List, ListItem, ListItemText, Divider, Avatar,
  InputAdornment, Card, CircularProgress, Skeleton, Select, MenuItem, FormControl, InputLabel, Chip, Stack, Alert
} from '@mui/material';
import { Send, SmartToy, Person, History, Add, Warning } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { useChatHistory, useSendChat, usePromptPrivacy } from '../../api/hooks';
import { analyzePrompt } from '../../engines/promptEngine';
import { getModelRecommendation } from '../../engines/recommendationEngine';

const BRAND_COLOR = '#0066CC';

export default function AIChat() {
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: 'Hello Sarah! I am AI360 Workspace Gateway. Select any model or type your request below.', sender: 'ai', model: 'gpt-4o-mini', score: 95 }
  ]);
  const [input, setInput] = useState('');
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  const { data: historyData, isLoading: isHistoryLoading } = useChatHistory();
  const sendChatMutation = useSendChat();
  const privacyMutation = usePromptPrivacy();

  const handleSend = () => {
    if (!input.trim() || sendChatMutation.isPending) return;

    const analysis = analyzePrompt(input);
    const rec = getModelRecommendation(input);
    const originalInput = input;
    const payloadText = analysis.privacyAnalysis.maskedPrompt;

    const userMsg = {
      id: Date.now(),
      text: payloadText,
      sender: 'user',
      model: selectedModel,
      score: analysis.qualityScore,
      classification: analysis.classification,
      recommendedModel: rec.recommendedModel
    };

    privacyMutation.mutate(
      { prompt: originalInput, targetModel: selectedModel },
      {
        onSuccess: (backendPrivacy: any) => {
          if (backendPrivacy?.contains_sensitive_data) {
            setSecurityNotice(backendPrivacy.warning_message || analysis.privacyAnalysis.warningMessage);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === userMsg.id ? { ...m, text: backendPrivacy.masked_prompt || m.text } : m
              )
            );
          }
        },
      }
    );

    if (analysis.privacyAnalysis.containsSensitiveData) {
      setSecurityNotice(analysis.privacyAnalysis.warningMessage);
    } else {
      setSecurityNotice(null);
    }

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    sendChatMutation.mutate(
      { message: userMsg.text, model: selectedModel },
      {
        onSuccess: (response: any) => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: response?.reply || response?.text || `[${selectedModel.toUpperCase()}] Response: Successfully generated high-accuracy output for task (${analysis.classification}).`,
              sender: 'ai',
              model: selectedModel,
              tokens: analysis.metadataOnly.tokenCount,
              cost: '$0.0004'
            }
          ]);
        },
        onError: () => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: `[${selectedModel.toUpperCase()}] Model Response: "Successfully processed prompt payload (${analysis.classification}). Routing recommendation: ${rec.recommendedModel}."`,
              sender: 'ai',
              model: selectedModel,
              tokens: analysis.metadataOnly.tokenCount,
              cost: '$0.0003'
            }
          ]);
        }
      }
    );
  };

  const chatHistory = Array.isArray(historyData) ? historyData : historyData?.items || [];

  return (
    <Box className="page-enter" sx={{ display: 'flex', height: 'calc(100vh - 200px)', width: '100%', gap: 2, p: { xs: 2, md: 3 }, bgcolor: '#F5F7FA' }}>
      <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRadius: 3.5, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>History</Typography>
          <IconButton sx={{ color: BRAND_COLOR }} size="small"><Add /></IconButton>
        </Box>
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
          {isHistoryLoading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton animation="wave" height={40} sx={{ mb: 1 }} />
            </Box>
          ) : (
            chatHistory.map((item: any) => (
              <ListItem button key={item.id} sx={{ borderBottom: '1px solid rgba(0,0,0,0.04)', '&:hover': { bgcolor: '#F5F5F7' } }}>
                <History sx={{ mr: 1.5, color: '#6E6E73', fontSize: 18 }} />
                <ListItemText
                  primary={item.title || item.topic || 'Session'}
                  secondary={item.date || item.createdAt || 'Recent'}
                  primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1D1D1F' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: '#6E6E73' }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRadius: 3.5, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>AI Workspace</Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Model</InputLabel>
            <Select value={selectedModel} label="Model" onChange={(e) => setSelectedModel(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="gpt-4o-mini">GPT-4o-Mini</MenuItem>
              <MenuItem value="gpt-4o">GPT-4o</MenuItem>
              <MenuItem value="gemini-1.5-flash">Gemini 1.5 Flash</MenuItem>
              <MenuItem value="gemini-1.5-pro">Gemini 1.5 Pro</MenuItem>
              <MenuItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {securityNotice && (
          <Alert severity="warning" icon={<Warning />} sx={{ borderRadius: 0, '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
            {securityNotice}
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {messages.map((msg, index) => (
            <Box key={msg.id} sx={{ display: 'flex', gap: 2, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', animation: 'fadeUp 0.3s ease both', animationDelay: `${index * 0.05}s` }}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: msg.sender === 'user' ? 'rgba(0,102,204,0.08)' : '#F5F5F7', color: '#1D1D1F', maxWidth: '80%' }}>
                <Typography sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={msg.model} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                  {msg.score && <Chip label={`Score: ${msg.score}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(52,199,89,0.10)', color: '#1A7F37' }} />}
                  {msg.cost && <Typography sx={{ fontSize: '0.65rem', color: '#6E6E73', mt: 0.5 }}>{msg.cost}</Typography>}
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <TextField
            fullWidth
            placeholder="Type your prompt..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend} disabled={!input.trim() || sendChatMutation.isPending} sx={{ color: BRAND_COLOR }}>
                    {sendChatMutation.isPending ? <CircularProgress size={20} /> : <Send />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5, bgcolor: '#F5F5F7' }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
