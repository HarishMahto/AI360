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

const BRAND_COLOR = '#1F5AA6';

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

  const handleNewChat = () => {
    setMessages([{ id: Date.now(), text: 'Hello! I am AI360 Workspace Gateway. Select any model or type your request below.', sender: 'ai', model: selectedModel, score: 95 }]);
    setInput('');
    setSecurityNotice(null);
  };

  const handleLoadHistory = (item: any) => {
    // Each /chat/history record is one real prompt/response pair persisted by the backend
    // (see PROMPT_HISTORY docs written in domains/ai_gateway/router.py) — restore both sides
    // of the actual saved conversation turn instead of a synthetic placeholder.
    const historyModel = item.model || selectedModel;
    const historical = [
      { id: Date.now(), text: item.prompt || 'Previous prompt.', sender: 'user', model: historyModel, score: item.promptScore ?? null },
      {
        id: Date.now() + 1,
        text: item.response || 'No response was recorded for this session.',
        sender: 'ai',
        model: historyModel,
        tokens: item.totalTokens,
        cost: item.estimatedCostUSD != null ? `$${Number(item.estimatedCostUSD).toFixed(4)}` : undefined,
      },
    ];
    setMessages(historical);
    setSelectedModel(historyModel);
    setSecurityNotice(null);
  };

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

    const chatPayload = {
      messages: [...messages, userMsg].map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || "",
      })),
      model: selectedModel,
    };

    sendChatMutation.mutate(
      chatPayload,
      {
        onSuccess: (response: any) => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: response?.content || `[${selectedModel.toUpperCase()}] Response: Connected, but no content returned.`,
              sender: 'ai',
              model: response?.model || selectedModel,
              tokens: response?.total_tokens || analysis.metadataOnly.tokenCount,
              cost: response?.estimated_cost_usd != null ? `$${Number(response.estimated_cost_usd).toFixed(4)}` : '$0.0004'
            }
          ]);
        },
        onError: (err: any) => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: `Error connecting to API: ${err.message || 'Unknown error'}.`,
              sender: 'ai',
              model: selectedModel,
              tokens: 0,
            }
          ]);
        }
      }
    );
  };

  // GET /chat/history responds with { data: [...], page, page_size, has_more } — read `.data`,
  // not `.items` (a prior mismatch here meant the history sidebar was always empty).
  const chatHistory = Array.isArray(historyData) ? historyData : historyData?.data || historyData?.items || [];

  return (
    <Box className="page-enter page-content" sx={{ display: 'flex', height: 'calc(100vh - 90px)', width: '100%', gap: 2, p: { xs: 1, md: 1.5 }, bgcolor: '#F4F6FA' }}>
      <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(31,90,166,0.09)' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' }}>History</Typography>
          <IconButton sx={{ color: BRAND_COLOR }} size="small" onClick={handleNewChat} title="New Chat"><Add /></IconButton>
        </Box>
        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
          {isHistoryLoading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton animation="wave" height={40} sx={{ mb: 1 }} />
            </Box>
          ) : (
            chatHistory.map((item: any) => (
              <ListItem button key={item.id} onClick={() => handleLoadHistory(item)} sx={{ borderBottom: '1px solid rgba(31,90,166,0.05)', '&:hover': { bgcolor: '#F0F4F8', cursor: 'pointer' } }}>
                <History sx={{ mr: 1.5, color: '#9CA3AF', fontSize: 18 }} />
                <ListItemText
                  primary={item.prompt ? (item.prompt.length > 42 ? `${item.prompt.slice(0, 42)}…` : item.prompt) : (item.title || item.topic || 'Session')}
                  secondary={item.timestamp ? new Date(item.timestamp).toLocaleString() : (item.date || item.createdAt || 'Recent')}
                  sx={{
                    '& .MuiListItemText-primary': { fontSize: '0.8125rem', fontWeight: 500, color: '#1A1D2E' },
                    '& .MuiListItemText-secondary': { fontSize: '0.75rem', color: '#4B5563' }
                  }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(31,90,166,0.09)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#1A1D2E', letterSpacing: '-0.01em' }}>AI Workspace</Typography>
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
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: msg.sender === 'user' ? '#E6E6FA' : '#FFFFFF', border: msg.sender === 'user' ? '1px solid #D8D8F6' : '1px solid rgba(31,90,166,0.09)', color: '#1A1D2E', maxWidth: '80%' }}>
                <Typography sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={msg.model} size="small" sx={{ height: 20, borderRadius: '5px', fontSize: '10px', fontWeight: 700 }} />
                  {msg.score && <Chip label={`Score: ${msg.score}`} size="small" sx={{ height: 20, borderRadius: '5px', fontSize: '10px', fontWeight: 700, bgcolor: 'rgba(5,150,105,0.10)', color: '#059669' }} />}
                  {msg.cost && <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mt: 0.5 }}>{msg.cost}</Typography>}
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(31,90,166,0.09)' }}>
          <TextField
            fullWidth
            placeholder="Type your prompt..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend} disabled={!input.trim() || sendChatMutation.isPending} sx={{ bgcolor: input.trim() ? '#E6E6FA' : 'transparent', color: input.trim() ? '#111827' : '#9CA3AF', borderRadius: '8px', p: 1, '&:hover': { bgcolor: input.trim() ? '#D8D8F6' : 'transparent' } }}>
                    {sendChatMutation.isPending ? <CircularProgress size={20} /> : <Send fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5, bgcolor: '#FAFAFD', '&.Mui-focused': { '& fieldset': { borderColor: '#E6E6FA !important', borderWidth: '1px' } } }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
