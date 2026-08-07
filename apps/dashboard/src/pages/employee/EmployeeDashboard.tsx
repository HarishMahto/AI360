import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  Divider,
  LinearProgress,
  TextField,
  Button,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardContent,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ContentCopy,
  Star,
  Share,
  TrendingUp,
  MonetizationOn,
  WorkspacePremium,
  AccessTime,
  Speed,
  History,
  Send,
} from '@mui/icons-material';
import {
  useEmployeeDashboard,
  useSendChat,
  usePromptCoach,
  useModelRecommendations,
  usePromptHistory,
  usePromptMarketplace,
  useLearningCoachTips,
  useSessionSummary,
  useToggleFavoritePrompt,
  useSaveThenPublishPrompt,
} from '../../api/hooks';
import { analyzePrompt } from '../../engines';

const TAB_NAME_MAP: Record<string, number> = {
  overview: 0,
  chat: 1,
  'prompt-coach': 2,
  'model-recs': 3,
  marketplace: 4,
  'learning-coach': 5,
  'privacy-guard': 6,
  'prompt-history': 7,
};

const BRAND_COLOR = '#1F5AA6';

export default function EmployeeDashboard() {
  const { data: serverData, isLoading } = useEmployeeDashboard();
  const sendChatMutation = useSendChat();

  const [searchParams] = useSearchParams();
  const currentTabKey = searchParams.get('tab') || 'overview';
  const activeTab = TAB_NAME_MAP[currentTabKey] ?? 0;

  const sessionSummaryData = useSessionSummary().data;
  const learningCoachData = useLearningCoachTips().data;
  const modelRecsData = useModelRecommendations().data;
  const marketplaceData = usePromptMarketplace().data;

  const [vaguePrompt, setVaguePrompt] = useState('Write Java API');
  const promptCoachQuery = usePromptCoach(vaguePrompt);
  const coachingResult = promptCoachQuery.data;
  const handleRunCoachDemo = () => promptCoachQuery.refetch();

  const [dismissedRecs, setDismissedRecs] = useState<Set<number>>(new Set());

  const toggleFavoriteMutation = useToggleFavoritePrompt();
  const saveThenPublishMutation = useSaveThenPublishPrompt();
  const [publishTitle, setPublishTitle] = useState('');
  const [publishCategory, setPublishCategory] = useState('Coding');
  const [publishContent, setPublishContent] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const [testPrivacyPrompt, setTestPrivacyPrompt] = useState('Customer ABC SAP password is SuperSecretSAP_2026! Please summarize these confidential financial metrics and architecture.');
  const privacyAnalysis = analyzePrompt(testPrivacyPrompt);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, text: 'Hello Sarah! I am AI360 Gateway. Select any model or type your request below.', sender: 'ai', model: 'gpt-4o-mini', score: 95, cost: '$0.0002' },
    { id: 2, text: 'Generate a Spring Boot 3 REST API using Java 21.', sender: 'user', model: 'gpt-4o-mini', score: 82 }
  ]);

  const [searchHistory, setSearchHistory] = useState('');
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyFavoriteOnly, setHistoryFavoriteOnly] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const { data: promptHistoryData } = usePromptHistory(historyQuery, historyFavoriteOnly);
  const [promptsList, setPromptsList] = useState([
    { id: 1, title: 'SAP Prompt', author: 'DevOps Team', rating: 5.0, uses: 520, hoursSaved: 1100, category: 'Enterprise', isFavorite: true, content: 'Analyze SAP RFC logs and extract key error codes in JSON format.' },
    { id: 2, title: 'Spring Boot Architecture Spec', author: 'Architecture Guild', rating: 4.9, uses: 340, hoursSaved: 780, category: 'Coding', isFavorite: true, content: 'Generate a Spring Boot 3 REST API using Java 21, JWT auth, and MySQL.' },
    { id: 3, title: 'Exec Summary Generator', author: 'Product Lead', rating: 4.8, uses: 290, hoursSaved: 540, category: 'Summarization', isFavorite: false, content: 'Summarize meeting transcripts into 3 bullet points with action items.' }
  ]);


  const handleSendChatMessage = () => {
    if (!chatInput.trim() || sendChatMutation.isPending) return;
    const userMsg = { id: Date.now(), text: chatInput, sender: 'user', model: selectedModel, score: Math.floor(Math.random() * 20) + 80 };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    sendChatMutation.mutate(
      { message: userMsg.text, model: selectedModel },
      {
        onSuccess: (res: any) => {
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: res?.reply || res?.content || `[${selectedModel.toUpperCase()}] Response: Successfully processed your request with high precision.`,
              sender: 'ai',
              model: selectedModel,
              cost: '$0.0004',
              tokens: 145
            }
          ]);
        },
        onError: () => {
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              text: `[${selectedModel.toUpperCase()}] Model processed your prompt: "Generate clean, well-structured response with high accuracy."`,
              sender: 'ai',
              model: selectedModel,
              cost: '$0.0003',
              tokens: 120
            }
          ]);
        }
      }
    );
  };



  const todayPrompts = serverData?.today_prompts ?? 43;
  const todayCost = serverData?.today_cost ?? 1.32;
  const avgScore = serverData?.average_score ?? 84;
  const totalHoursSaved = serverData?.hours_saved ?? 2.8;
  const midDay = sessionSummaryData?.snapshots?.[0] ?? { prompts: 34, cost: '$1.32', hoursSaved: 2.3 };
  const endOfDay = sessionSummaryData?.snapshots?.[1] ?? { prompts: 43, cost: '$1.80', hoursSaved: 2.8 };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '12px' }} />
            </Grid>
          ))}
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={360} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={360} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', pb: 8, overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        
        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            {/* ── Stat Cards Row ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1.5, mb: 2, width: '100%' }}>
              {[
                {
                  label: 'Todays Prompts', value: todayPrompts.toString(), sub: '+12% vs average',
                  subColor: '#059669', accent: '#1F5AA6',
                  icon: <TrendingUp sx={{ fontSize: 18, color: '#1F5AA6' }} />, iconBg: 'rgba(31,90,166,0.08)',
                },
                {
                  label: 'Todays Cost', value: `$${todayCost}`, sub: '72% saved via optimization',
                  subColor: '#059669', accent: '#0284C7',
                  icon: <MonetizationOn sx={{ fontSize: 18, color: '#0284C7' }} />, iconBg: 'rgba(2,132,199,0.08)',
                },
                {
                  label: 'Prompt Quality', value: `${avgScore}/100`, sub: 'Clarity, Context & Specificity',
                  subColor: '#6B7280', accent: '#D97706',
                  icon: <WorkspacePremium sx={{ fontSize: 18, color: '#D97706' }} />, iconBg: 'rgba(217,119,6,0.08)',
                },
                {
                  label: 'Hours Saved', value: `${totalHoursSaved}h`, sub: 'Equivalent to 35% boost',
                  subColor: '#1F5AA6', accent: '#7C3AED',
                  icon: <AccessTime sx={{ fontSize: 18, color: '#7C3AED' }} />, iconBg: 'rgba(124,58,237,0.08)',
                },
                {
                  label: 'Mid-Day Snapshot', value: midDay.prompts.toString(), sub: `${midDay.cost} · ${midDay.hoursSaved}h saved`,
                  subColor: '#059669', accent: '#059669',
                  icon: <Speed sx={{ fontSize: 18, color: '#059669' }} />, iconBg: 'rgba(5,150,105,0.08)',
                },
                {
                  label: 'End-of-Day', value: endOfDay.prompts.toString(), sub: `${endOfDay.hoursSaved}h saved today`,
                  subColor: '#1F5AA6', accent: '#0284C7',
                  icon: <History sx={{ fontSize: 18, color: '#0284C7' }} />, iconBg: 'rgba(2,132,199,0.08)',
                },
              ].map((stat, i) => (
                <Box
                  key={i}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    p: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                    cursor: 'default',
                    borderTop: `3px solid ${stat.accent}`,
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                      borderColor: '#D1D5DB',
                    },
                  }}
                >
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.75 }}>
                    {stat.icon}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9CA3AF', mb: 0.5 }}>{stat.label}</Typography>
                  <Typography sx={{ fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15, mb: 0.375 }}>{stat.value}</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: stat.subColor, fontWeight: 500 }}>{stat.sub}</Typography>
                </Box>
              ))}
            </Box>

            {/* ── Productivity Trend & Session Summary ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 1.5, width: '100%' }}>
              {/* Productivity Trend */}
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', p: 3, height: '100%' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>Productivity Trend</Typography>
                  <Chip label="This Week" size="small" sx={{ bgcolor: '#F3F4F6', color: '#6B7280', fontSize: '0.7rem', fontWeight: 500, border: 'none' }} />
                </Stack>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Mon', hours: 2.1 },
                      { day: 'Tue', hours: 2.8 },
                      { day: 'Wed', hours: 2.4 },
                      { day: 'Thu', hours: 3.1 },
                      { day: 'Fri', hours: 2.8 },
                      { day: 'Sat', hours: 1.0 },
                      { day: 'Sun', hours: 0.5 }
                    ]}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1F5AA6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#1F5AA6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dx={-10} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          fontSize: '0.8125rem',
                          color: '#111827',
                        }}
                        labelStyle={{ color: '#6B7280', fontWeight: 600, marginBottom: 2 }}
                      />
                      <Area type="monotone" dataKey="hours" stroke="#1F5AA6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" dot={false} activeDot={{ r: 5, fill: '#1F5AA6', strokeWidth: 2, stroke: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>

              {/* Session Summary */}
              <Box sx={{ bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', p: 3, height: '100%' }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', mb: 3 }}>Session Summary</Typography>
                <TableContainer sx={{ borderRadius: '8px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        {['Period', 'Prompts', 'Cost', 'Saved'].map((h, hi) => (
                          <TableCell key={h} align={hi === 0 ? 'left' : hi === 3 ? 'right' : 'center'}
                            sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9CA3AF', borderBottom: '1px solid #F3F4F6', py: 1.25, px: 2 }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(sessionSummaryData?.snapshots || [
                        { period: 'Mid-day', prompts: 34, tokens: '—', cost: '$1.32', hoursSaved: 2.3 },
                        { period: 'End-of-day', prompts: 43, tokens: '8,300', cost: '$1.80', hoursSaved: 2.8 }
                      ]).map((snap: any, i: number) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: '#F9FAFB' }, transition: 'background 0.15s ease', ...(i === 1 ? { '&:last-child td': { border: 0 } } : {}) }}>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1.5, px: 2, borderBottom: '1px solid #F3F4F6', color: '#374151', fontWeight: 500 }}>
                            {snap.period}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.5, px: 2, borderBottom: '1px solid #F3F4F6', color: '#111827', fontWeight: 600 }}>{snap.prompts}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.5, px: 2, borderBottom: '1px solid #F3F4F6', color: '#374151' }}>{typeof snap.cost === 'string' ? snap.cost : `$${snap.cost}`}</TableCell>
                          <TableCell align="right" sx={{ py: 1.5, px: 2, borderBottom: '1px solid #F3F4F6' }}>
                            <Chip label={`${snap.hoursSaved}h`} size="small" sx={{ bgcolor: 'rgba(5,150,105,0.08)', color: '#059669', fontWeight: 600, fontSize: '0.72rem', height: 20 }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2.5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
                  {[
                    { label: 'Total Prompts', value: `${endOfDay.prompts}`, color: '#1F5AA6', bg: 'rgba(31,90,166,0.06)' },
                    { label: 'Total Saved', value: `${endOfDay.hoursSaved}h`, color: '#059669', bg: 'rgba(5,150,105,0.06)' },
                  ].map((q, qi) => (
                    <Box key={qi} sx={{ p: 1.5, borderRadius: '8px', bgcolor: q.bg, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: q.color, letterSpacing: '-0.02em' }}>{q.value}</Typography>
                      <Typography sx={{ fontSize: '0.67rem', color: '#6B7280', fontWeight: 500, mt: 0.25 }}>{q.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                height: 660,
                overflow: 'hidden',
              }}
            >
              {/* ── Header ── */}
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFAFA' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>AI Chat Workspace</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.75} mt={0.25}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#059669' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#6B7280' }}>Gateway Active</Typography>
                  </Stack>
                </Box>
                <FormControl size="small">
                  <Select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    sx={{
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: '#374151',
                      bgcolor: '#FFFFFF',
                      minWidth: 180,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1F5AA6', borderWidth: '1px' },
                    }}
                  >
                    <MenuItem value="gpt-4o-mini" sx={{ fontSize: '0.8125rem' }}>GPT-4o Mini</MenuItem>
                    <MenuItem value="gpt-4o" sx={{ fontSize: '0.8125rem' }}>GPT-4o</MenuItem>
                    <MenuItem value="gemini-1.5-flash" sx={{ fontSize: '0.8125rem' }}>Gemini 1.5 Flash</MenuItem>
                    <MenuItem value="gemini-1.5-pro" sx={{ fontSize: '0.8125rem' }}>Gemini 1.5 Pro</MenuItem>
                    <MenuItem value="claude-3-5-sonnet" sx={{ fontSize: '0.8125rem' }}>Claude 3.5 Sonnet</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* ── Messages ── */}
              <Box sx={{
                flexGrow: 1, px: 3, py: 2.5, overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 2,
                bgcolor: '#FAFAFA',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 2 },
              }}>
                {chatMessages.map((msg) => (
                  <Box key={msg.id} sx={{ display: 'flex', gap: 1.5, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <Box sx={{
                      width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: msg.sender === 'user' ? '#1F5AA6' : '#F3F4F6',
                      border: msg.sender === 'ai' ? '1px solid #E5E7EB' : 'none',
                    }}>
                      {msg.sender === 'user'
                        ? <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>YOU</Typography>
                        : <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#1F5AA6', letterSpacing: '0.02em' }}>AI</Typography>
                      }
                    </Box>
                    {/* Bubble */}
                    <Box sx={{
                      maxWidth: '76%',
                      p: 1.75,
                      borderRadius: msg.sender === 'user' ? '12px 3px 12px 12px' : '3px 12px 12px 12px',
                      bgcolor: msg.sender === 'user' ? '#1F5AA6' : '#FFFFFF',
                      border: msg.sender === 'ai' ? '1px solid #E5E7EB' : 'none',
                      boxShadow: msg.sender === 'ai' ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                    }}>
                      <Typography sx={{ fontSize: '0.875rem', color: msg.sender === 'user' ? '#FFFFFF' : '#1F2937', lineHeight: 1.6 }}>{msg.text}</Typography>
                      <Stack direction="row" spacing={0.75} mt={1} flexWrap="wrap" useFlexGap>
                        <Chip label={msg.model} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 500, bgcolor: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : '#F3F4F6', color: msg.sender === 'user' ? '#fff' : '#6B7280', border: 'none' }} />
                        {msg.score && <Chip label={`Score ${msg.score}/100`} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: 'rgba(5,150,105,0.1)', color: '#059669', border: 'none' }} />}
                        {msg.cost && <Typography sx={{ fontSize: '0.62rem', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#9CA3AF', alignSelf: 'center' }}>{msg.cost}</Typography>}
                      </Stack>
                    </Box>
                  </Box>
                ))}
                {sendChatMutation.isPending && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#1F5AA6' }}>AI</Typography>
                    </Box>
                    <Box sx={{ p: 1.75, borderRadius: '3px 12px 12px 12px', bgcolor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={12} sx={{ color: '#1F5AA6' }} />
                      <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Processing your request...</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* ── Input Bar ── */}
              <Box sx={{ px: 3, py: 2, borderTop: '1px solid #F3F4F6', bgcolor: '#FFFFFF' }}>
                <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    size="small"
                    InputProps={{
                      sx: {
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        bgcolor: '#F9FAFB',
                        color: '#111827',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1F5AA6', borderWidth: '1px' },
                        '& input::placeholder': { color: '#9CA3AF', opacity: 1 },
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleSendChatMessage}
                    disabled={!chatInput.trim() || sendChatMutation.isPending}
                    sx={{
                      width: 38, height: 38, borderRadius: '8px',
                      bgcolor: chatInput.trim() ? '#1F5AA6' : '#F3F4F6',
                      color: chatInput.trim() ? '#fff' : '#9CA3AF',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                      '&:hover': { bgcolor: chatInput.trim() ? '#1A4F96' : '#E9EAEB' },
                      '&.Mui-disabled': { bgcolor: '#F3F4F6', color: '#D1D5DB' },
                    }}
                  >
                    {sendChatMutation.isPending ? <CircularProgress size={16} sx={{ color: '#9CA3AF' }} /> : <Send sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: '#D1D5DB', mt: 1, textAlign: 'center' }}>
                  Powered by AI360 Gateway · Press Enter to send
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Prompt Coach</Typography>
                  <TextField fullWidth value={vaguePrompt} onChange={(e) => setVaguePrompt(e.target.value)} placeholder="Enter vague prompt..." sx={{ mb: 2 }} />
                  <Button variant="outlined" onClick={handleRunCoachDemo} disabled={promptCoachQuery.isFetching} sx={{ mb: 3, borderColor: 'rgba(31,90,166,0.2)', color: '#1A1D2E', '&:hover': { borderColor: 'rgba(31,90,166,0.3)', bgcolor: '#F0F4F8' } }}>
                    {promptCoachQuery.isFetching ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}Optimize Prompt
                  </Button>
                  {coachingResult && (
                    <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'rgba(31,90,166,0.05)', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E' }}>Suggestion</Typography>
                        <Chip label={`Score: ${coachingResult.scoreOutOf100}/100`} size="small" sx={{ bgcolor: 'rgba(5,150,105,0.10)', color: '#059669', fontWeight: 600 }} />
                      </Stack>
                      <Typography sx={{ fontSize: '0.875rem', color: '#4B5563', mb: 2 }}>{coachingResult.suggestion}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E', mb: 1 }}>Original</Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', p: 1.5, mb: 2, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)' }}>{coachingResult.originalPrompt}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E', mb: 1 }}>Optimized</Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#1A1D2E', p: 1.5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)' }}>{coachingResult.optimizedPrompt}</Typography>
                    </Box>
                  )}
                </Card>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Token Optimizer</Typography>
                  <TableContainer sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', mb: 3 }}>
                    <Table>
                      <TableBody>
                        <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Original</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem' }}>{coachingResult?.tokenOptimizer.currentTokens ?? 650} tokens</TableCell></TableRow>
                        <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Optimized</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem' }}>{coachingResult?.tokenOptimizer.optimizedTokens ?? 180} tokens</TableCell></TableRow>
                        <TableRow sx={{ bgcolor: '#F0F4F8' }}><TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Savings</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>{coachingResult?.tokenOptimizer.savingsPercent ?? 72}%</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E', mb: 1.5 }}>Quality Score Breakdown</Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'Clarity', val: coachingResult?.dimensions.clarity ? Math.round(coachingResult.dimensions.clarity * 5) : 85 },
                      { label: 'Context', val: coachingResult?.dimensions.context ? Math.round(coachingResult.dimensions.context * 5) : 80 },
                      { label: 'Specificity', val: coachingResult?.dimensions.specificity ? Math.round(coachingResult.dimensions.specificity * 5) : 85 },
                      { label: 'Format', val: coachingResult?.dimensions.format ? Math.round(coachingResult.dimensions.format * 5) : 80 },
                      { label: 'Use of Examples', val: coachingResult?.dimensions.useOfExamples ? Math.round(coachingResult.dimensions.useOfExamples * 5) : 80 },
                    ].map((dim, i) => (
                      <Box key={i}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>{dim.label}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E' }}>{dim.val}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={dim.val} sx={{ height: 4, borderRadius: 2, bgcolor: '#F0F4F8', '& .MuiLinearProgress-bar': { bgcolor: BRAND_COLOR } }} />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, width: '100%' }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Model Recommendations</Typography>
              <TableContainer sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', width: '100%' }}>
                <Table sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#4B5563' }}>Context</TableCell>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#4B5563' }}>Recommendation</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#4B5563' }}>Savings</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#4B5563' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(modelRecsData || [{ signal: 'Summarization', recommendation: 'Gemini 1.5 Flash', estimatedSaving: '70% cheaper' }])
                      .filter((_: any, idx: number) => !dismissedRecs.has(idx))
                      .map((rec: any, idx: number) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F4F6FA' } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>{rec.signal}</TableCell>
                        <TableCell><Chip label={rec.recommendation} size="small" sx={{ bgcolor: 'rgba(31,90,166,0.10)', color: BRAND_COLOR, fontWeight: 500 }} /></TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 600 }}>{rec.estimatedSaving}</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Button size="small" variant="contained" onClick={() => { setSelectedModel(rec.targetModel || 'gemini-1.5-flash'); setSnackbar({ open: true, message: `Switched active model to ${rec.recommendation}`, severity: 'success' }); }} sx={{ mr: 1, bgcolor: BRAND_COLOR }}>Apply</Button>
                          <Button size="small" variant="outlined" onClick={() => setDismissedRecs(prev => new Set(prev).add(idx))} sx={{ color: '#1A1D2E', borderColor: 'rgba(31,90,166,0.2)' }}>Dismiss</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}

        {activeTab === 4 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size="small" placeholder="Search prompts..." value={searchHistory} onChange={(e) => setSearchHistory(e.target.value)} sx={{ width: { xs: '100%', sm: 300 } }} />
              <Button variant="contained" sx={{ bgcolor: BRAND_COLOR }} onClick={() => { setPublishTitle(''); setPublishCategory('Coding'); setPublishContent(chatInput || ''); setPublishDialogOpen(true); }}>Publish to Marketplace</Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, width: '100%' }}>
              {(marketplaceData || promptsList).filter((p: any) => {
                const term = searchHistory.toLowerCase();
                const title = p.title?.toLowerCase() || '';
                const content = (p.promptTemplate || p.content || '').toLowerCase();
                const author = (p.authorTeam || p.author || '').toLowerCase();
                return title.includes(term) || content.includes(term) || author.includes(term);
              }).map((p: any) => (
                <Box key={p.id} sx={{ width: '100%' }}>
                  <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 0.5 }}>{p.title}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mb: 0.5 }}>By {p.authorTeam || p.author}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#D97706', mb: 1.5 }}>{p.starDisplay || '★★★★★'}</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E', mb: 2, flexGrow: 1, fontStyle: 'italic' }}>"{p.promptTemplate || p.content}"</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 'auto', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>Uses: {p.usedByCount || p.uses}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#059669' }}>{p.hoursSaved}h saved</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button size="small" variant="outlined" onClick={() => setChatInput(p.promptTemplate || p.content || '')}>Use</Button>
                    </Stack>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 5 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Learning Coach</Typography>
                  <Stack spacing={2}>
                    {(learningCoachData?.tips || [{ tip: 'Use concrete examples', description: 'Include sample input/output pairs.' }]).map((item: any, idx: number) => (
                      <Box key={idx} sx={{ p: 2, borderRadius: '12px', bgcolor: '#F0F4F8', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E' }}>{item.tip}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5, mb: item.targetWeakness ? 1 : 0 }}>{item.description}</Typography>
                        {item.targetWeakness && <Chip label={item.targetWeakness} size="small" sx={{ bgcolor: 'rgba(217,119,6,0.1)', color: '#D97706', fontWeight: 600, fontSize: '0.7rem' }} />}
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Achievements</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, width: '100%' }}>
                    {[
                      { title: 'Prompt Master', desc: 'Maintained 80+ score', earned: (serverData?.average_score ?? 84) >= 80 },
                      { title: 'Token Optimizer', desc: 'Saved 50k tokens', earned: (serverData?.tokens_saved ?? 60000) >= 50000 },
                      { title: 'Daily Achiever', desc: '30+ prompts today', earned: (serverData?.today_prompts ?? 43) >= 30 },
                      { title: 'AI Power User', desc: 'Saved 2+ hours', earned: (serverData?.hours_saved ?? 2.8) >= 2 }
                    ].map((badge, idx) => (
                      <Box key={idx} sx={{ width: '100%' }}>
                        <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', opacity: badge.earned ? 1 : 0.5 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E' }}>{badge.title}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>{badge.desc}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 6 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Privacy Guard</Typography>
              <TextField fullWidth multiline rows={3} value={testPrivacyPrompt} onChange={(e) => setTestPrivacyPrompt(e.target.value)} sx={{ mb: 2 }} />
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: privacyAnalysis.privacyAnalysis.containsSensitiveData ? 'rgba(220,38,38,0.1)' : 'rgba(5,150,105,0.1)' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: privacyAnalysis.privacyAnalysis.containsSensitiveData ? '#DC2626' : '#059669' }}>
                  {privacyAnalysis.privacyAnalysis.containsSensitiveData ? 'Sensitive Data Detected' : 'Safe to Send'}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#1A1D2E', mt: 1, fontFamily: 'monospace' }}>
                  {privacyAnalysis.privacyAnalysis.maskedPrompt}
                </Typography>
              </Box>
            </Card>
          </Box>
        )}

        {activeTab === 7 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Prompt History</Typography>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField size="small" placeholder="Search history..." value={historyQuery} onChange={(e) => setHistoryQuery(e.target.value)} sx={{ width: { xs: '100%', sm: 300 } }} />
                <Button variant={historyFavoriteOnly ? 'contained' : 'outlined'} sx={historyFavoriteOnly ? { bgcolor: BRAND_COLOR } : {}} onClick={() => setHistoryFavoriteOnly(!historyFavoriteOnly)}>Favorites</Button>
              </Box>
              <List>
                {(promptHistoryData || []).map((p: any, idx: number) => (
                  <React.Fragment key={p.id}>
                    <ListItem sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E' }}>{p.title}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => setChatInput(p.promptText)}><ContentCopy fontSize="small" /></IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: p.isFavorite ? '#D97706' : 'inherit' }}
                            onClick={() => toggleFavoriteMutation.mutate(p.id, {
                              onError: () => setSnackbar({ open: true, message: 'Could not update favorite.', severity: 'error' })
                            })}
                          >
                            <Star fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(p.promptText);
                                setSnackbar({ open: true, message: 'Prompt copied — share the link with your team.', severity: 'success' });
                              } catch {
                                setSnackbar({ open: true, message: 'Could not copy prompt to clipboard.', severity: 'error' });
                              }
                            }}
                          >
                            <Share fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#4B5563', mb: 1 }}>"{p.promptText}"</Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={p.category} size="small" sx={{ fontSize: '0.7rem' }} />
                        <Chip label={`Score: ${p.promptScore}`} size="small" sx={{ fontSize: '0.7rem', bgcolor: 'rgba(5,150,105,0.1)', color: '#059669' }} />
                        <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 0.5 }}>{new Date(p.createdAt).toLocaleDateString()}</Typography>
                      </Stack>
                    </ListItem>
                    {idx < (promptHistoryData || []).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Box>
        )}

      </Box>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Publish to Marketplace</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Title" fullWidth size="small" value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)} />
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select label="Category" value={publishCategory} onChange={(e) => setPublishCategory(e.target.value)}>
              <MenuItem value="Coding">Coding</MenuItem>
              <MenuItem value="Enterprise">Enterprise</MenuItem>
              <MenuItem value="Summarization">Summarization</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Prompt Content" multiline rows={4} fullWidth value={publishContent} onChange={(e) => setPublishContent(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: BRAND_COLOR }}
            disabled={!publishTitle.trim() || !publishContent.trim() || saveThenPublishMutation.isPending}
            onClick={() => saveThenPublishMutation.mutate(
              { title: publishTitle, promptText: publishContent, category: publishCategory.toUpperCase() },
              {
                onSuccess: () => {
                  setPublishDialogOpen(false);
                  setSnackbar({ open: true, message: `"${publishTitle}" published to the marketplace.`, severity: 'success' });
                },
                onError: () => setSnackbar({ open: true, message: 'Failed to publish prompt.', severity: 'error' }),
              }
            )}
          >
            {saveThenPublishMutation.isPending ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}Publish
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
