import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Grid,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  Divider,
  LinearProgress,
  useTheme,
  TextField,
  Button,
  Paper,
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
  Tooltip as MuiTooltip,
  Badge,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';

const TAB_NAME_MAP: Record<string, number> = {
  overview: 0,
  chat: 1,
  'prompt-coach': 2,
  'model-recs': 3,
  marketplace: 4,
  'learning-coach': 5,
  'privacy-guard': 6,
};
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  CheckCircle,
  AccessTime,
  TrendingUp,
  MoreVert,
  Assignment,
  EmojiEvents,
  AutoAwesome,
  Send,
  Person,
  SmartToy,
  Search,
  Star,
  Share,
  ContentCopy,
  Tune,
  Lightbulb,
  Psychology,
  ElectricBolt,
  WorkspacePremium,
  MonetizationOn,
  History,
  Bookmark,
  Store,
  School,
  Speed,
  Security,
  Shield,
  Warning,
  VpnKey,
  VerifiedUser
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import {
  useEmployeeDashboard,
  useSendChat,
  useScorePrompt,
  useOptimizePrompt,
  useLeaderboards,
  usePromptCoach,
  useModelRecommendations,
  usePromptHistory,
  usePromptMarketplace,
  useLearningCoachTips,
  useSessionSummary
} from '../../api/hooks';
import { analyzePrompt, getModelRecommendation, type LeaderboardCategory } from '../../engines';

const BRAND_COLOR = '#1F5AA6';

export default function EmployeeDashboard() {
  const theme = useTheme();
  const { data: serverData, isLoading } = useEmployeeDashboard();
  const sendChatMutation = useSendChat();
  const scoreMutation = useScorePrompt();
  const optimizeMutation = useOptimizePrompt();

  const [searchParams] = useSearchParams();
  const currentTabKey = searchParams.get('tab') || 'overview';
  const activeTab = TAB_NAME_MAP[currentTabKey] ?? 0;
  const leaderboardsData = useLeaderboards().data || {};

  const sessionSummaryData = useSessionSummary().data;
  const learningCoachData = useLearningCoachTips().data;
  const modelRecsData = useModelRecommendations().data;
  const marketplaceData = usePromptMarketplace().data;
  const promptCoachQuery = usePromptCoach();

  const [testPrivacyPrompt, setTestPrivacyPrompt] = useState('Customer ABC SAP password is SuperSecretSAP_2026! Please summarize these confidential financial metrics and architecture.');
  const [activeLeaderboardCat, setActiveLeaderboardCat] = useState<LeaderboardCategory>('Top Prompt Writer');
  const privacyAnalysis = analyzePrompt(testPrivacyPrompt);
  const modelRec = getModelRecommendation(testPrivacyPrompt);

  const [vaguePrompt, setVaguePrompt] = useState('Write Java API');
  const [coachingResult, setCoachingResult] = useState<{
    original: string;
    suggestion: string;
    optimized: string;
    score: number;
    rubric: { clarity: number; context: number; specificity: number; format: number; examples: number };
    tokensOriginal: number;
    tokensOptimized: number;
    savingsPct: number;
  } | null>({
    original: 'Write Java API',
    suggestion: 'Add the framework version for a more precise result.',
    optimized: 'Generate a Spring Boot 3 REST API using Java 21, JWT authentication, MySQL, and Clean Architecture.',
    score: 82,
    rubric: { clarity: 85, context: 80, specificity: 85, format: 80, examples: 78 },
    tokensOriginal: 650,
    tokensOptimized: 180,
    savingsPct: 72
  });

  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, text: 'Hello Sarah! I am AI360 Gateway. Select any model or type your request below.', sender: 'ai', model: 'gpt-4o-mini', score: 95, cost: '$0.0002' },
    { id: 2, text: 'Generate a Spring Boot 3 REST API using Java 21.', sender: 'user', model: 'gpt-4o-mini', score: 82 }
  ]);

  const [searchHistory, setSearchHistory] = useState('');
  const [promptsList, setPromptsList] = useState([
    { id: 1, title: 'SAP Prompt', author: 'DevOps Team', rating: 5.0, uses: 520, hoursSaved: 1100, category: 'Enterprise', isFavorite: true, content: 'Analyze SAP RFC logs and extract key error codes in JSON format.' },
    { id: 2, title: 'Spring Boot Architecture Spec', author: 'Architecture Guild', rating: 4.9, uses: 340, hoursSaved: 780, category: 'Coding', isFavorite: true, content: 'Generate a Spring Boot 3 REST API using Java 21, JWT auth, and MySQL.' },
    { id: 3, title: 'Exec Summary Generator', author: 'Product Lead', rating: 4.8, uses: 290, hoursSaved: 540, category: 'Summarization', isFavorite: false, content: 'Summarize meeting transcripts into 3 bullet points with action items.' }
  ]);

  const handleRunCoachDemo = () => {
    if (promptCoachQuery.data) {
      setCoachingResult({
        original: vaguePrompt || promptCoachQuery.data.originalPrompt,
        suggestion: promptCoachQuery.data.suggestion,
        optimized: promptCoachQuery.data.optimizedPrompt,
        score: promptCoachQuery.data.scoreOutOf100,
        rubric: {
          clarity: promptCoachQuery.data.dimensions?.clarity ? Math.round(promptCoachQuery.data.dimensions.clarity * 5) : 85,
          context: promptCoachQuery.data.dimensions?.context ? Math.round(promptCoachQuery.data.dimensions.context * 5) : 80,
          specificity: promptCoachQuery.data.dimensions?.specificity ? Math.round(promptCoachQuery.data.dimensions.specificity * 5) : 85,
          format: promptCoachQuery.data.dimensions?.format ? Math.round(promptCoachQuery.data.dimensions.format * 5) : 80,
          examples: promptCoachQuery.data.dimensions?.useOfExamples ? Math.round(promptCoachQuery.data.dimensions.useOfExamples * 5) : 78
        },
        tokensOriginal: promptCoachQuery.data.tokenOptimizer?.currentTokens || 650,
        tokensOptimized: promptCoachQuery.data.tokenOptimizer?.optimizedTokens || 180,
        savingsPct: promptCoachQuery.data.tokenOptimizer?.savingsPercent || 72
      });
    } else {
      setCoachingResult({
        original: vaguePrompt || 'Write Java API',
        suggestion: 'Add the framework version for a more precise result.',
        optimized: 'Generate a Spring Boot 3 REST API using Java 21, JWT authentication, MySQL, and Clean Architecture.',
        score: 82,
        rubric: { clarity: 85, context: 80, specificity: 85, format: 80, examples: 78 },
        tokensOriginal: 650,
        tokensOptimized: 180,
        savingsPct: 72
      });
    }
  };

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

  const userData = serverData?.user || {
    name: 'Sarah Jenkins',
    role: 'Senior Product Engineer',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    greeting: 'Ready to create & optimize AI workflows today?'
  };

  return (
    <Box className="page-enter" sx={{ bgcolor: '#F4F6FA', minHeight: '100vh', pb: 8, overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 1, md: 1.5 }, pt: { xs: 1, md: 1.5 }, width: '100%' }}>
        
        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            {/* Stat Cards Row - 100% Full Screen Width */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2, mb: 2, width: '100%' }}>
              {[
                { label: 'TODAYS PROMPTS', value: '43', sub: '+12% vs avg', subColor: '#059669', accent: '#1F5AA6', icon: <TrendingUp fontSize="small" sx={{ color: '#1F5AA6' }}/> },
                { label: 'TODAYS COST', value: '$1.32', sub: '72% saved via optimization', subColor: '#059669', accent: '#60A5FA', icon: <MonetizationOn fontSize="small" sx={{ color: '#60A5FA' }}/> },
                { label: 'PROMPT QUALITY SCORE', value: '84/100', sub: 'Clarity, Context & Specificity', subColor: '#4B5563', accent: '#D97706', icon: <WorkspacePremium fontSize="small" sx={{ color: '#D97706' }}/> },
                { label: 'HOURS SAVED', value: '2.8h', sub: 'Equivalent to 35% boost', subColor: '#1F5AA6', accent: '#6B46C1', icon: <AccessTime fontSize="small" sx={{ color: '#6B46C1' }}/> },
                { label: 'MID-DAY SNAPSHOT', value: '34', sub: '$1.32 • 2.3h saved', subColor: '#059669', accent: '#059669', icon: <Speed fontSize="small" sx={{ color: '#059669' }}/> },
                { label: 'END-OF-DAY SUMMARY', value: '43', sub: '8,300 tokens • 2.8h saved', subColor: '#1F5AA6', accent: '#0284C7', icon: <History fontSize="small" sx={{ color: '#0284C7' }}/> }
              ].map((stat, i) => (
                <Card key={i} sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', borderTop: `3px solid ${stat.accent}`, '&:hover': { boxShadow: '0 4px 16px rgba(31,90,166,0.09)', borderColor: 'rgba(31,90,166,0.24)' } }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.accent, 0.1) }}>
                      {stat.icon}
                    </Box>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4B5563', mb: 1 }}>{stat.label}</Typography>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1D2E', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: stat.subColor, mt: 0.5 }}>{stat.sub}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Productivity Trend & Session Summary Row - 100% Full Screen Width */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 2, width: '100%' }}>
              <Card sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Productivity Trend</Typography>
                <Box sx={{ height: 320, width: '100%' }}>
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
                          <stop offset="5%" stopColor="#1F5AA6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#1F5AA6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAE6" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4B5563' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(31,90,166,0.2)', boxShadow: '0 4px 16px rgba(31,90,166,0.12)' }} />
                      <Area type="monotone" dataKey="hours" stroke="#1F5AA6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Card>

              <Card sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Session Summary</Typography>
                <TableContainer sx={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F0F4F8' }}>
                        <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.12)', py: 1.25, px: 2 }}>Period</TableCell>
                        <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.12)', py: 1.25, px: 2 }} align="center">Prompts</TableCell>
                        <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.12)', py: 1.25, px: 2 }} align="center">Cost</TableCell>
                        <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4B5563', borderBottom: '1px solid rgba(31,90,166,0.12)', py: 1.25, px: 2 }} align="right">Saved</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ '&:hover': { bgcolor: '#F4F6FA' } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(31,90,166,0.08)' }}>Mid-day</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(31,90,166,0.08)' }}>34</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(31,90,166,0.08)' }}>$1.32</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(31,90,166,0.08)', color: '#059669', fontWeight: 600 }}>2.3h</TableCell>
                      </TableRow>
                      <TableRow sx={{ '&:hover': { bgcolor: '#F4F6FA' }, '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', py: 1.375, px: 2 }}>End-of-day</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2 }}>43</TableCell>
                        <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2 }}>$1.80</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, color: '#059669', fontWeight: 600 }}>2.8h</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: 600 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(31,90,166,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E' }}>AI Chat Workspace</Typography>
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
              <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chatMessages.map((msg) => (
                  <Box key={msg.id} sx={{ display: 'flex', gap: 2, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: msg.sender === 'user' ? 'rgba(31,90,166,0.08)' : '#F0F4F8', color: '#1A1D2E', maxWidth: '80%' }}>
                      <Typography sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                      <Stack direction="row" spacing={1} mt={1}>
                        <Chip label={msg.model} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        {msg.score && <Chip label={`Score: ${msg.score}/100`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(5,150,105,0.10)', color: '#059669' }} />}
                        {msg.cost && <Typography sx={{ fontSize: '0.65rem', color: '#4B5563', mt: 0.5 }}>{msg.cost}</Typography>}
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid rgba(31,90,166,0.12)' }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleSendChatMessage} disabled={!chatInput.trim() || sendChatMutation.isPending} sx={{ color: BRAND_COLOR }}>
                          {sendChatMutation.isPending ? <CircularProgress size={20} /> : <Send />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                />
              </Box>
            </Card>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both', width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, width: '100%' }}>
              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Prompt Coach</Typography>
                  <TextField fullWidth value={vaguePrompt} onChange={(e) => setVaguePrompt(e.target.value)} placeholder="Enter vague prompt..." sx={{ mb: 2 }} />
                  <Button variant="outlined" onClick={handleRunCoachDemo} sx={{ mb: 3, borderColor: 'rgba(31,90,166,0.2)', color: '#1A1D2E', '&:hover': { borderColor: 'rgba(31,90,166,0.3)', bgcolor: '#F0F4F8' } }}>
                    Optimize Prompt
                  </Button>
                  {coachingResult && (
                    <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'rgba(31,90,166,0.05)', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E', mb: 1 }}>Suggestion</Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#4B5563', mb: 2 }}>{coachingResult.suggestion}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1D2E', mb: 1 }}>Optimized</Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#1A1D2E', p: 1.5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)' }}>{coachingResult.optimized}</Typography>
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
                        <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Original</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem' }}>650 tokens</TableCell></TableRow>
                        <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Optimized</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem' }}>180 tokens</TableCell></TableRow>
                        <TableRow sx={{ bgcolor: '#F0F4F8' }}><TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Savings</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669' }}>72%</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1A1D2E', mb: 1.5 }}>Quality Score Breakdown</Typography>
                  <Stack spacing={1.5}>
                    {[{ label: 'Clarity', val: 85 }, { label: 'Context', val: 80 }, { label: 'Specificity', val: 85 }].map((dim, i) => (
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(modelRecsData || [{ signal: 'Summarization', recommendation: 'Gemini 1.5 Flash', estimatedSaving: '70% cheaper' }]).map((rec: any, idx: number) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F4F6FA' } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', color: '#1A1D2E' }}>{rec.signal}</TableCell>
                        <TableCell><Chip label={rec.recommendation} size="small" sx={{ bgcolor: 'rgba(31,90,166,0.10)', color: BRAND_COLOR, fontWeight: 500 }} /></TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', color: '#059669', fontWeight: 600 }}>{rec.estimatedSaving}</TableCell>
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
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField size="small" placeholder="Search prompts..." value={searchHistory} onChange={(e) => setSearchHistory(e.target.value)} sx={{ width: 300 }} />
              <Button variant="contained" sx={{ bgcolor: BRAND_COLOR }}>Publish to Marketplace</Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, width: '100%' }}>
              {(marketplaceData || promptsList).map((p: any) => (
                <Box key={p.id} sx={{ width: '100%' }}>
                  <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 0.5 }}>{p.title}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mb: 1.5 }}>By {p.author}</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#1A1D2E', mb: 2, flexGrow: 1, fontStyle: 'italic' }}>"{p.content}"</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>Uses: {p.uses}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#059669' }}>{p.hoursSaved}h saved</Typography>
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
                        <Typography sx={{ fontSize: '0.75rem', color: '#4B5563', mt: 0.5 }}>{item.description}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Card sx={{ borderRadius: '12px', border: '1px solid rgba(31,90,166,0.09)', boxShadow: '0 1px 4px rgba(31,90,166,0.05)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1A1D2E', mb: 2 }}>Achievements</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, width: '100%' }}>
                    {[{ title: 'Prompt Master', desc: 'Maintained 80+ score', earned: true }, { title: 'Token Optimizer', desc: 'Saved 50k tokens', earned: false }].map((badge, idx) => (
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

      </Box>
    </Box>
  );
}
