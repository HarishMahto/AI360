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
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%', position: 'relative', bgcolor: '#F5F4FB', minHeight: 'calc(100vh - 64px)', borderTopLeftRadius: 24, p: { xs: 2, md: 3 }, overflow: 'hidden' }}>
            {/* Ambient Background Blobs */}
            <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, bgcolor: '#5B57F0', opacity: 0.35, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 500, height: 500, bgcolor: '#1FAE7A', opacity: 0.35, filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, gridAutoRows: 'minmax(120px, auto)', gap: 2.5, width: '100%' }}>
                
                {/* 1. Hero Card: Today's Prompts (Wide) */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 8' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3, 
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: '#EDECFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingUp sx={{ fontSize: 18, color: '#5B57F0' }} />
                        </Box>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#201F2E' }}>Total Prompts Today</Typography>
                      </Stack>
                      <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '3.25rem', fontWeight: 600, color: '#201F2E', lineHeight: 1 }}>{todayPrompts}</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#5B57F0', fontWeight: 600, mt: 1 }}>+12% vs average</Typography>
                    </Box>
                    <Box sx={{ width: 120, height: 60 }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[
                            { val: 20 }, { val: 25 }, { val: 22 }, { val: 35 }, { val: 30 }, { val: 45 }, { val: todayPrompts }
                         ]}>
                           <defs>
                              <linearGradient id="sparkline" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#5B57F0" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#5B57F0" stopOpacity={0} />
                              </linearGradient>
                           </defs>
                           <Area type="monotone" dataKey="val" stroke="#5B57F0" strokeWidth={2} fill="url(#sparkline)" dot={false} />
                         </AreaChart>
                       </ResponsiveContainer>
                    </Box>
                  </Box>
                </Box>

                {/* 2. Radial Gauge: Prompt Quality */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 4' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3,
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2} alignSelf="center">
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: '#FCF0DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <WorkspacePremium sx={{ fontSize: 18, color: '#E8A23D' }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#201F2E' }}>Quality Score</Typography>
                  </Stack>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                    <CircularProgress variant="determinate" value={100} size={100} thickness={4} sx={{ color: '#FCF0DE' }} />
                    <CircularProgress variant="determinate" value={avgScore} size={100} thickness={4} sx={{ color: '#E8A23D', position: 'absolute', left: 0, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.75rem', fontWeight: 600, color: '#201F2E', lineHeight: 1 }}>{avgScore}</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#85839A', mt: 0.5 }}>/ 100</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* 3. Cost Card */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 3' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3,
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: '#FFEDE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MonetizationOn sx={{ fontSize: 18, color: '#FF6F59' }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#201F2E' }}>Total API Cost</Typography>
                  </Stack>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 600, color: '#201F2E' }}>${todayCost}</Typography>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#1FAE7A', fontWeight: 600, mt: 0.5 }}>72% saved</Typography>
                </Box>

                {/* 4. Hours Saved Card */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 3' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3,
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: '#E7F4FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AccessTime sx={{ fontSize: 18, color: '#3A9BDC' }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#201F2E' }}>Time Saved</Typography>
                  </Stack>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 600, color: '#201F2E' }}>{totalHoursSaved}h</Typography>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', fontWeight: 600, mt: 0.5 }}>35% boost</Typography>
                </Box>

                {/* 5. Mid-Day Snapshot */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 3' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3,
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: '#F6EAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Speed sx={{ fontSize: 18, color: '#A84FC7' }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#201F2E' }}>Mid-Day Snapshot</Typography>
                  </Stack>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 600, color: '#201F2E' }}>{midDay.prompts} <Typography component="span" sx={{ fontSize: '1rem', color: '#85839A', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Prompts</Typography></Typography>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', fontWeight: 600, mt: 0.5 }}>{midDay.cost} · {midDay.hoursSaved}h saved</Typography>
                </Box>

                {/* 6. End of Day Snapshot */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 3' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3,
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: '#F6EAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <History sx={{ fontSize: 18, color: '#A84FC7' }} />
                    </Box>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#201F2E' }}>End of Day Snapshot</Typography>
                  </Stack>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '2.25rem', fontWeight: 600, color: '#201F2E' }}>{endOfDay.prompts} <Typography component="span" sx={{ fontSize: '1rem', color: '#85839A', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Prompts</Typography></Typography>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A', fontWeight: 600, mt: 0.5 }}>{endOfDay.hoursSaved}h saved</Typography>
                </Box>

                {/* 7. Trend Chart */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 7' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3,
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', height: 380, display: 'flex', flexDirection: 'column'
                }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E' }}>Productivity Trend</Typography>
                    <Chip label="This Week" size="small" sx={{ bgcolor: '#EFEEFA', color: '#5B57F0', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 500, border: 'none', borderRadius: '8px' }} />
                  </Stack>
                  <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { day: 'Mon', hours: 2.1 },
                        { day: 'Tue', hours: 2.8 },
                        { day: 'Wed', hours: 2.4 },
                        { day: 'Thu', hours: 3.1 },
                        { day: 'Fri', hours: 2.8 },
                        { day: 'Sat', hours: 1.0 },
                        { day: 'Sun', hours: 0.5 }
                      ]} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHoursNew" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3A9BDC" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3A9BDC" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E7F5" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#85839A' }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fill: '#85839A' }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            background: '#FFFFFF',
                            border: '1px solid #E9E7F5',
                            boxShadow: '0 4px 20px rgba(32, 31, 46, 0.08)',
                            fontFamily: 'IBM Plex Mono, monospace',
                            fontSize: '0.85rem',
                            color: '#201F2E',
                          }}
                          labelStyle={{ fontFamily: 'Inter, sans-serif', color: '#85839A', fontWeight: 600, marginBottom: 4 }}
                        />
                        <Area type="monotone" dataKey="hours" stroke="#3A9BDC" strokeWidth={3} fillOpacity={1} fill="url(#colorHoursNew)" activeDot={{ r: 6, fill: '#3A9BDC', strokeWidth: 3, stroke: '#fff' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                {/* 8. Session Summary Panel */}
                <Box sx={{ 
                  gridColumn: { xs: 'span 1', md: 'span 5' }, 
                  bgcolor: '#FFFFFF', borderRadius: '22px', border: '1px solid #E9E7F5', p: 3,
                  boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', display: 'flex', flexDirection: 'column'
                }}>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Session Summary</Typography>
                  <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    {(sessionSummaryData?.snapshots || [
                      { period: 'Mid-day', prompts: 34, tokens: '—', cost: '$1.32', hoursSaved: 2.3 },
                      { period: 'End-of-day', prompts: 43, tokens: '8,300', cost: '$1.80', hoursSaved: 2.8 }
                    ]).map((snap: any, i: number) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: '14px', border: '1px solid #E9E7F5', bgcolor: '#FAFAFD' }}>
                        <Box>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#201F2E' }}>{snap.period}</Typography>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A', mt: 0.5 }}>{snap.prompts} prompts · {typeof snap.cost === 'string' ? snap.cost : `$${snap.cost}`}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#1FAE7A', bgcolor: '#E3F7EE', px: 1.5, py: 0.5, borderRadius: '6px' }}>{snap.hoursSaved}h saved</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                  <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {[
                      { label: 'Total Prompts', value: `${endOfDay.prompts}`, color: '#5B57F0', bg: '#EDECFE' },
                      { label: 'Total Saved', value: `${endOfDay.hoursSaved}h`, color: '#1FAE7A', bg: '#E3F7EE' },
                    ].map((q, qi) => (
                      <Box key={qi} sx={{ p: 2, borderRadius: '14px', bgcolor: q.bg, textAlign: 'center' }}>
                        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '1.25rem', fontWeight: 600, color: q.color }}>{q.value}</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#85839A', fontWeight: 500, mt: 0.5 }}>{q.label}</Typography>
                      </Box>
                    ))}
                  </Box>
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
                borderRadius: '22px',
                border: '1px solid #E9E7F5',
                boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                height: 660,
                overflow: 'hidden',
              }}
            >
              {/* ── Header ── */}
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#FAFAFA' }}>
                <Box>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', lineHeight: 1.3 }}>AI Chat Workspace</Typography>
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
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E9E7F5', borderRadius: '8px' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5B57F0', borderWidth: '1px' },
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
                      bgcolor: msg.sender === 'user' ? '#E6E6FA' : '#F5F4FB',
                      border: msg.sender === 'ai' ? '1px solid #E9E7F5' : 'none',
                    }}>
                      {msg.sender === 'user'
                        ? <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#111827', letterSpacing: '0.02em' }}>YOU</Typography>
                        : <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: '#5B57F0', letterSpacing: '0.02em' }}>AI</Typography>
                      }
                    </Box>
                    {/* Bubble */}
                    <Box sx={{
                      maxWidth: '76%',
                      p: 2,
                      borderRadius: msg.sender === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      bgcolor: msg.sender === 'user' ? '#E6E6FA' : '#FFFFFF',
                      border: msg.sender === 'ai' ? '1px solid #E9E7F5' : 'none',
                      boxShadow: msg.sender === 'ai' ? '0 4px 20px rgba(32, 31, 46, 0.02)' : 'none',
                    }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: msg.sender === 'user' ? '#111827' : '#201F2E', lineHeight: 1.6 }}>{msg.text}</Typography>
                      <Stack direction="row" spacing={0.75} mt={1.5} flexWrap="wrap" useFlexGap>
                        <Chip label={msg.model} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', height: 20, fontSize: '0.65rem', fontWeight: 500, bgcolor: msg.sender === 'user' ? 'rgba(17,24,39,0.1)' : '#F5F4FB', color: msg.sender === 'user' ? '#111827' : '#85839A', border: 'none', borderRadius: '6px' }} />
                        {msg.score && <Chip label={`Score ${msg.score}/100`} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#E3F7EE', color: '#1FAE7A', border: 'none', borderRadius: '6px' }} />}
                        {msg.cost && <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.65rem', color: msg.sender === 'user' ? 'rgba(17,24,39,0.7)' : '#85839A', alignSelf: 'center', ml: 1 }}>{msg.cost}</Typography>}
                      </Stack>
                    </Box>
                  </Box>
                ))}
                {sendChatMutation.isPending && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F5F4FB', border: '1px solid #E9E7F5' }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 700, color: '#5B57F0' }}>AI</Typography>
                    </Box>
                    <Box sx={{ p: 2, borderRadius: '4px 18px 18px 18px', bgcolor: '#FFFFFF', border: '1px solid #E9E7F5', display: 'flex', alignItems: 'center', gap: 1.5, boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)' }}>
                      <CircularProgress size={14} sx={{ color: '#5B57F0' }} />
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#85839A' }}>Processing your request...</Typography>
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
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif',
                        bgcolor: '#FAFAFD',
                        color: '#201F2E',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E9E7F5' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#E6E6FA', borderWidth: '1px' },
                        '& input::placeholder': { color: '#85839A', opacity: 1 },
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleSendChatMessage}
                    disabled={!chatInput.trim() || sendChatMutation.isPending}
                    sx={{
                      width: 40, height: 40, borderRadius: '10px',
                      bgcolor: chatInput.trim() ? '#E6E6FA' : '#F5F4FB',
                      color: chatInput.trim() ? '#111827' : '#85839A',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                      '&:hover': { bgcolor: chatInput.trim() ? '#D8D8F6' : '#E9E7F5' },
                      '&.Mui-disabled': { bgcolor: '#F5F4FB', color: '#D1D5DB' },
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
                <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Prompt Coach</Typography>
                  <TextField fullWidth value={vaguePrompt} onChange={(e) => setVaguePrompt(e.target.value)} placeholder="Enter vague prompt..." sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
                  <Button variant="outlined" onClick={handleRunCoachDemo} disabled={promptCoachQuery.isFetching} sx={{ mb: 3, borderRadius: '12px', borderColor: '#E9E7F5', color: '#111827', '&:hover': { borderColor: '#E6E6FA', bgcolor: '#E6E6FA', color: '#111827' } }}>
                    {promptCoachQuery.isFetching ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}Optimize Prompt
                  </Button>
                  {coachingResult && (
                    <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F5F4FB', borderLeft: '4px solid #5B57F0' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#201F2E' }}>Suggestion</Typography>
                        <Chip label={`Score: ${coachingResult.scoreOutOf100}/100`} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', bgcolor: '#E3F7EE', color: '#1FAE7A', fontWeight: 600 }} />
                      </Stack>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#4B5563', mb: 2 }}>{coachingResult.suggestion}</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#201F2E', mb: 1 }}>Original</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4B5563', p: 1.5, mb: 2, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E7F5' }}>{coachingResult.originalPrompt}</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#201F2E', mb: 1 }}>Optimized</Typography>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#201F2E', p: 1.5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E7F5' }}>{coachingResult.optimizedPrompt}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Token Optimizer</Typography>
                  <TableContainer sx={{ borderRadius: '16px', border: '1px solid #E9E7F5', mb: 4 }}>
                    <Table>
                      <TableBody>
                        <TableRow><TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>Original</TableCell><TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem' }}>{coachingResult?.tokenOptimizer.currentTokens ?? 650} tokens</TableCell></TableRow>
                        <TableRow><TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>Optimized</TableCell><TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem' }}>{coachingResult?.tokenOptimizer.optimizedTokens ?? 180} tokens</TableCell></TableRow>
                        <TableRow sx={{ bgcolor: '#FAFAFD' }}><TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600 }}>Savings</TableCell><TableCell align="right" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', fontWeight: 600, color: '#1FAE7A' }}>{coachingResult?.tokenOptimizer.savingsPercent ?? 72}%</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#201F2E', mb: 2 }}>Quality Score Breakdown</Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'Clarity', val: coachingResult?.dimensions.clarity ? Math.round(coachingResult.dimensions.clarity * 5) : 85 },
                      { label: 'Context', val: coachingResult?.dimensions.context ? Math.round(coachingResult.dimensions.context * 5) : 80 },
                      { label: 'Specificity', val: coachingResult?.dimensions.specificity ? Math.round(coachingResult.dimensions.specificity * 5) : 85 },
                      { label: 'Format', val: coachingResult?.dimensions.format ? Math.round(coachingResult.dimensions.format * 5) : 80 },
                      { label: 'Use of Examples', val: coachingResult?.dimensions.useOfExamples ? Math.round(coachingResult.dimensions.useOfExamples * 5) : 80 },
                    ].map((dim, i) => (
                      <Box key={i}>
                        <Stack direction="row" justifyContent="space-between" mb={0.75}>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#4B5563' }}>{dim.label}</Typography>
                          <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#201F2E' }}>{dim.val}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={dim.val} sx={{ height: 6, borderRadius: 3, bgcolor: '#F5F4FB', '& .MuiLinearProgress-bar': { bgcolor: '#5B57F0', borderRadius: 3 } }} />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, width: '100%' }}>
              <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Model Recommendations</Typography>
              <TableContainer sx={{ borderRadius: '16px', border: '1px solid #E9E7F5', width: '100%' }}>
                <Table sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#FAFAFD' }}>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A' }}>Context</TableCell>
                      <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A' }}>Recommendation</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A' }}>Savings</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#85839A' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(modelRecsData || [{ signal: 'Summarization', recommendation: 'Gemini 1.5 Flash', estimatedSaving: '70% cheaper' }])
                      .filter((_: any, idx: number) => !dismissedRecs.has(idx))
                      .map((rec: any, idx: number) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F5F4FB' } }}>
                        <TableCell sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#201F2E', fontWeight: 500 }}>{rec.signal}</TableCell>
                        <TableCell><Chip label={rec.recommendation} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', bgcolor: '#F5F4FB', color: '#5B57F0', fontWeight: 600, borderRadius: '6px' }} /></TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#1FAE7A', fontWeight: 600 }}>{rec.estimatedSaving}</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Button size="small" variant="contained" onClick={() => { setSelectedModel(rec.targetModel || 'gemini-1.5-flash'); setSnackbar({ open: true, message: `Switched active model to ${rec.recommendation}`, severity: 'success' }); }} sx={{ mr: 1, bgcolor: '#E6E6FA', color: '#111827', borderRadius: '8px', boxShadow: 'none', '&:hover': { bgcolor: '#D8D8F6', boxShadow: 'none' } }}>Apply</Button>
                          <Button size="small" variant="outlined" onClick={() => setDismissedRecs(prev => new Set(prev).add(idx))} sx={{ color: '#201F2E', borderColor: '#E9E7F5', borderRadius: '8px', '&:hover': { borderColor: '#E6E6FA', bgcolor: '#F5F4FB', color: '#111827' } }}>Dismiss</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}

        {activeTab === 4 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size="small" placeholder="Search prompts..." value={searchHistory} onChange={(e) => setSearchHistory(e.target.value)} sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
              <Button variant="contained" sx={{ bgcolor: '#E6E6FA', color: '#111827', borderRadius: '10px', boxShadow: 'none', '&:hover': { bgcolor: '#D8D8F6', boxShadow: 'none' } }} onClick={() => { setPublishTitle(''); setPublishCategory('Coding'); setPublishContent(chatInput || ''); setPublishDialogOpen(true); }}>Publish to Marketplace</Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3, width: '100%' }}>
              {(marketplaceData || promptsList).filter((p: any) => {
                const term = searchHistory.toLowerCase();
                const title = p.title?.toLowerCase() || '';
                const content = (p.promptTemplate || p.content || '').toLowerCase();
                const author = (p.authorTeam || p.author || '').toLowerCase();
                return title.includes(term) || content.includes(term) || author.includes(term);
              }).map((p: any) => (
                <Box key={p.id} sx={{ width: '100%' }}>
                  <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.15rem', fontWeight: 600, color: '#201F2E', mb: 0.5 }}>{p.title}</Typography>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#85839A', mb: 0.5 }}>By {p.authorTeam || p.author}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#E8A23D', mb: 2, letterSpacing: '0.1em' }}>{p.starDisplay || '★★★★★'}</Typography>
                    <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4B5563', mb: 3, flexGrow: 1, fontStyle: 'italic', lineHeight: 1.6 }}>"{p.promptTemplate || p.content}"</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 'auto', alignItems: 'center' }}>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#85839A' }}>Uses: {p.usedByCount || p.uses}</Typography>
                      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#1FAE7A', fontWeight: 600, bgcolor: '#E3F7EE', px: 1, py: 0.25, borderRadius: '4px' }}>{p.hoursSaved}h saved</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button size="small" variant="outlined" onClick={() => setChatInput(p.promptTemplate || p.content || '')} sx={{ borderRadius: '8px', color: '#111827', borderColor: '#E9E7F5', '&:hover': { borderColor: '#E6E6FA', bgcolor: '#F5F4FB', color: '#111827' } }}>Use</Button>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 5 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Learning Coach</Typography>
                  <Stack spacing={2}>
                    {(learningCoachData?.tips || [{ tip: 'Use concrete examples', description: 'Include sample input/output pairs.' }]).map((item: any, idx: number) => (
                      <Box key={idx} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#F5F4FB', borderLeft: '4px solid #5B57F0' }}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#201F2E' }}>{item.tip}</Typography>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4B5563', mt: 0.5, mb: item.targetWeakness ? 1.5 : 0 }}>{item.description}</Typography>
                        {item.targetWeakness && <Chip label={item.targetWeakness} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', bgcolor: '#FCF0DE', color: '#E8A23D', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }} />}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Achievements</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, width: '100%' }}>
                    {[
                      { title: 'Prompt Master', desc: 'Maintained 80+ score', earned: (serverData?.average_score ?? 84) >= 80, color: '#5B57F0', bg: '#EDECFE' },
                      { title: 'Token Optimizer', desc: 'Saved 50k tokens', earned: (serverData?.tokens_saved ?? 60000) >= 50000, color: '#1FAE7A', bg: '#E3F7EE' },
                      { title: 'Daily Achiever', desc: '30+ prompts today', earned: (serverData?.today_prompts ?? 43) >= 30, color: '#FF6F59', bg: '#FFEDE8' },
                      { title: 'AI Power User', desc: 'Saved 2+ hours', earned: (serverData?.hours_saved ?? 2.8) >= 2, color: '#3A9BDC', bg: '#E7F4FC' }
                    ].map((badge, idx) => (
                      <Box key={idx} sx={{ width: '100%' }}>
                        <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: badge.earned ? 'transparent' : '#E9E7F5', bgcolor: badge.earned ? badge.bg : '#FAFAFD', opacity: badge.earned ? 1 : 0.6 }}>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: badge.earned ? badge.color : '#85839A' }}>{badge.title}</Typography>
                          <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#4B5563', mt: 0.5 }}>{badge.desc}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 6 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3 }}>
              <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Privacy Guard</Typography>
              <TextField fullWidth multiline rows={3} value={testPrivacyPrompt} onChange={(e) => setTestPrivacyPrompt(e.target.value)} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
              <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: privacyAnalysis.privacyAnalysis.containsSensitiveData ? '#FFF2F2' : '#E3F7EE' }}>
                <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: privacyAnalysis.privacyAnalysis.containsSensitiveData ? '#DC2626' : '#059669' }}>
                  {privacyAnalysis.privacyAnalysis.containsSensitiveData ? 'Sensitive Data Detected' : 'Safe to Send'}
                </Typography>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.85rem', color: '#201F2E', mt: 1 }}>
                  {privacyAnalysis.privacyAnalysis.maskedPrompt}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === 7 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Box sx={{ borderRadius: '22px', border: '1px solid #E9E7F5', boxShadow: '0 4px 20px rgba(32, 31, 46, 0.02)', bgcolor: '#FFFFFF', p: 3 }}>
              <Typography sx={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: 600, color: '#201F2E', mb: 3 }}>Prompt History</Typography>
              <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField size="small" placeholder="Search history..." value={historyQuery} onChange={(e) => setHistoryQuery(e.target.value)} sx={{ width: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'Inter, sans-serif' } }} />
                <Button variant={historyFavoriteOnly ? 'contained' : 'outlined'} sx={historyFavoriteOnly ? { bgcolor: '#E8A23D', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#D97706', boxShadow: 'none' }, borderRadius: '10px' } : { borderColor: '#E9E7F5', color: '#201F2E', borderRadius: '10px', '&:hover': { borderColor: '#E8A23D' } }} onClick={() => setHistoryFavoriteOnly(!historyFavoriteOnly)}>Favorites</Button>
              </Box>
              <List>
                {(promptHistoryData || []).map((p: any, idx: number) => (
                  <React.Fragment key={p.id}>
                    <ListItem sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1.5 }}>
                        <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#201F2E' }}>{p.title}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => setChatInput(p.promptText)} sx={{ color: '#85839A', '&:hover': { color: '#5B57F0', bgcolor: '#F5F4FB' } }}><ContentCopy fontSize="small" /></IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: p.isFavorite ? '#E8A23D' : '#85839A', '&:hover': { color: '#E8A23D', bgcolor: '#FCF0DE' } }}
                            onClick={() => toggleFavoriteMutation.mutate(p.id, {
                              onError: () => setSnackbar({ open: true, message: 'Could not update favorite.', severity: 'error' })
                            })}
                          >
                            <Star fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: '#85839A', '&:hover': { color: '#5B57F0', bgcolor: '#F5F4FB' } }}
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
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4B5563', mb: 2, fontStyle: 'italic', lineHeight: 1.6 }}>"{p.promptText}"</Typography>
                      <Stack direction="row" spacing={1.5}>
                        <Chip label={p.category} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', bgcolor: '#F5F4FB', color: '#5B57F0', borderRadius: '6px' }} />
                        <Chip label={`Score: ${p.promptScore}`} size="small" sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', bgcolor: '#E3F7EE', color: '#1FAE7A', borderRadius: '6px' }} />
                        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#85839A', alignSelf: 'center' }}>{new Date(p.createdAt).toLocaleDateString()}</Typography>
                      </Stack>
                    </ListItem>
                    {idx < (promptHistoryData || []).length - 1 && <Divider sx={{ borderColor: '#E9E7F5' }} />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
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
            sx={{ bgcolor: '#E6E6FA', color: '#111827' }}
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
