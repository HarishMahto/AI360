import React, { useState } from 'react';
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
  Tabs,
  Tab,
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

const BRAND_COLOR = '#0066CC';

export default function EmployeeDashboard() {
  const theme = useTheme();
  const { data: serverData, isLoading } = useEmployeeDashboard();
  const sendChatMutation = useSendChat();
  const scoreMutation = useScorePrompt();
  const optimizeMutation = useOptimizePrompt();

  const [activeTab, setActiveTab] = useState(0);
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
    <Box className="page-enter" sx={{ bgcolor: '#F5F7FA', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
        
        {/* User Header */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between', gap: 4, background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(13,148,136,0.03) 100%)', borderRadius: 3, p: 3, mb: 3, border: '1px solid rgba(37,99,235,0.07)' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar src={userData.avatar} sx={{ width: 84, height: 84 }} />
            <Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#1D1D1F' }}>
                Hello, {userData.name.split(' ')[0]}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: '#6E6E73', mt: 0.5 }}>
                {userData.role} • {userData.greeting}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                Mid-Day Snapshot
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="baseline" mt={0.5}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1D1D1F' }}>34</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: BRAND_COLOR }}>$1.32</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759' }}>2.3h saved</Typography>
              </Stack>
            </Box>
            <Box sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73' }}>
                End-of-Day Summary
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="baseline" mt={0.5}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1D1D1F' }}>43</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6E6E73' }}>8,300 tokens</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759' }}>2.8h saved</Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid rgba(0,0,0,0.08)', '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0', bgcolor: '#0066CC' } }}>
          <Tab label="Overview" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab label="AI Chat" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab label="Prompt Coach" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab label="Model Recommendations" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab label="Marketplace" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab label="Learning Coach" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
          <Tab label="Privacy Guard" disableRipple sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem', color: '#6E6E73', minHeight: 40, '&.Mui-selected': { color: '#1D1D1F', fontWeight: 600 } }} />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: 'TODAYS PROMPTS', value: '43', sub: '+12% vs avg', subColor: '#34C759', accent: '#2563EB', icon: <TrendingUp fontSize="small" sx={{ color: '#2563EB' }}/> },
                { label: 'TODAYS COST', value: '$1.32', sub: '72% saved via optimization', subColor: '#34C759', accent: '#0D9488', icon: <MonetizationOn fontSize="small" sx={{ color: '#0D9488' }}/> },
                { label: 'PROMPT QUALITY SCORE', value: '84/100', sub: 'Clarity, Context & Specificity', subColor: '#6E6E73', accent: '#D97706', icon: <WorkspacePremium fontSize="small" sx={{ color: '#D97706' }}/> },
                { label: 'HOURS SAVED', value: '2.8h', sub: 'Equivalent to 35% boost', subColor: '#0066CC', accent: '#7C3AED', icon: <AccessTime fontSize="small" sx={{ color: '#7C3AED' }}/> }
              ].map((stat, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', transition: 'box-shadow 0.25s ease, border-color 0.25s ease', borderTop: `3px solid ${stat.accent}`, '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.14)' } }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, position: 'relative' }}>
                      <Box sx={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.accent, 0.1) }}>
                        {stat.icon}
                      </Box>
                      <Typography sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6E6E73', mb: 1 }}>{stat.label}</Typography>
                      <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1D1D1F', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: stat.subColor, mt: 0.5 }}>{stat.sub}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Productivity Trend</Typography>
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
                            <stop offset="5%" stopColor="#0066CC" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6E6E73' }} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                        <Area type="monotone" dataKey="hours" stroke="#0066CC" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Session Summary</Typography>
                  <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'none' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                          <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }}>Period</TableCell>
                          <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }} align="center">Prompts</TableCell>
                          <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }} align="center">Cost</TableCell>
                          <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6E6E73', borderBottom: '1px solid rgba(0,0,0,0.08)', py: 1.25, px: 2 }} align="right">Saved</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow sx={{ '&:hover': { bgcolor: '#F5F5F7' } }}>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Mid-day</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>34</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>$1.32</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', color: '#34C759', fontWeight: 600 }}>2.3h</TableCell>
                        </TableRow>
                        <TableRow sx={{ '&:hover': { bgcolor: '#F5F5F7' }, '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ fontSize: '0.8125rem', py: 1.375, px: 2 }}>End-of-day</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2 }}>43</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2 }}>$1.80</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8125rem', py: 1.375, px: 2, color: '#34C759', fontWeight: 600 }}>2.8h</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: 600 }}>
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F' }}>AI Chat Workspace</Typography>
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
                    <Box sx={{ p: 2, borderRadius: 3, bgcolor: msg.sender === 'user' ? 'rgba(0,102,204,0.08)' : '#F5F5F7', color: '#1D1D1F', maxWidth: '80%' }}>
                      <Typography sx={{ fontSize: '0.875rem' }}>{msg.text}</Typography>
                      <Stack direction="row" spacing={1} mt={1}>
                        <Chip label={msg.model} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                        {msg.score && <Chip label={`Score: ${msg.score}/100`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(52,199,89,0.10)', color: '#1A7F37' }} />}
                        {msg.cost && <Typography sx={{ fontSize: '0.65rem', color: '#6E6E73', mt: 0.5 }}>{msg.cost}</Typography>}
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
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
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Prompt Coach</Typography>
                  <TextField fullWidth value={vaguePrompt} onChange={(e) => setVaguePrompt(e.target.value)} placeholder="Enter vague prompt..." sx={{ mb: 2 }} />
                  <Button variant="outlined" onClick={handleRunCoachDemo} sx={{ mb: 3, borderColor: 'rgba(0,0,0,0.12)', color: '#1D1D1F', '&:hover': { borderColor: 'rgba(0,0,0,0.2)', bgcolor: '#F5F5F7' } }}>
                    Optimize Prompt
                  </Button>
                  {coachingResult && (
                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(0,102,204,0.04)', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', mb: 1 }}>Suggestion</Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#6E6E73', mb: 2 }}>{coachingResult.suggestion}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F', mb: 1 }}>Optimized</Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: '#1D1D1F', p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>{coachingResult.optimized}</Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Token Optimizer</Typography>
                  <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', mb: 3 }}>
                    <Table>
                      <TableBody>
                        <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Original</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem' }}>650 tokens</TableCell></TableRow>
                        <TableRow><TableCell sx={{ fontSize: '0.8125rem' }}>Optimized</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem' }}>180 tokens</TableCell></TableRow>
                        <TableRow sx={{ bgcolor: '#F5F5F7' }}><TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Savings</TableCell><TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34C759' }}>72%</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F', mb: 1.5 }}>Quality Score Breakdown</Typography>
                  <Stack spacing={1.5}>
                    {[{ label: 'Clarity', val: 85 }, { label: 'Context', val: 80 }, { label: 'Specificity', val: 85 }].map((dim, i) => (
                      <Box key={i}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{dim.label}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1D1D1F' }}>{dim.val}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={dim.val} sx={{ height: 4, borderRadius: 2, bgcolor: '#F5F5F7', '& .MuiLinearProgress-bar': { bgcolor: BRAND_COLOR } }} />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 3 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Model Recommendations</Typography>
              <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F5F7' }}>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73' }}>Context</TableCell>
                      <TableCell sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73' }}>Recommendation</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.67rem', fontWeight: 600, color: '#6E6E73' }}>Savings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(modelRecsData || [{ signal: 'Summarization', recommendation: 'Gemini 1.5 Flash', estimatedSaving: '70% cheaper' }]).map((rec: any, idx: number) => (
                      <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F5F5F7' } }}>
                        <TableCell sx={{ fontSize: '0.8125rem', color: '#1D1D1F' }}>{rec.signal}</TableCell>
                        <TableCell><Chip label={rec.recommendation} size="small" sx={{ bgcolor: 'rgba(0,102,204,0.08)', color: BRAND_COLOR, fontWeight: 500 }} /></TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8125rem', color: '#34C759', fontWeight: 600 }}>{rec.estimatedSaving}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
        )}

        {activeTab === 4 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <TextField size="small" placeholder="Search prompts..." value={searchHistory} onChange={(e) => setSearchHistory(e.target.value)} sx={{ width: 300 }} />
              <Button variant="contained" sx={{ bgcolor: BRAND_COLOR }}>Publish to Marketplace</Button>
            </Box>
            <Grid container spacing={3}>
              {(marketplaceData || promptsList).map((p: any) => (
                <Grid item xs={12} md={4} key={p.id}>
                  <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>{p.title}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mb: 1.5 }}>By {p.author}</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#1D1D1F', mb: 2, flexGrow: 1, fontStyle: 'italic' }}>"{p.content}"</Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>Uses: {p.uses}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#34C759' }}>{p.hoursSaved}h saved</Typography>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 5 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Learning Coach</Typography>
                  <Stack spacing={2}>
                    {(learningCoachData?.tips || [{ tip: 'Use concrete examples', description: 'Include sample input/output pairs.' }]).map((item: any, idx: number) => (
                      <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: '#F5F5F7', borderLeft: `3px solid ${BRAND_COLOR}` }}>
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>{item.tip}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73', mt: 0.5 }}>{item.description}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3, height: '100%' }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Achievements</Typography>
                  <Grid container spacing={2}>
                    {[{ title: 'Prompt Master', desc: 'Maintained 80+ score', earned: true }, { title: 'Token Optimizer', desc: 'Saved 50k tokens', earned: false }].map((badge, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', opacity: badge.earned ? 1 : 0.5 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1D1D1F' }}>{badge.title}</Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#6E6E73' }}>{badge.desc}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 6 && (
          <Box sx={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', bgcolor: '#FFFFFF', p: 3 }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1D1D1F', mb: 2 }}>Privacy Guard</Typography>
              <TextField fullWidth multiline rows={3} value={testPrivacyPrompt} onChange={(e) => setTestPrivacyPrompt(e.target.value)} sx={{ mb: 2 }} />
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: privacyAnalysis.privacyAnalysis.containsSensitiveData ? 'rgba(255,59,48,0.1)' : 'rgba(52,199,89,0.1)' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: privacyAnalysis.privacyAnalysis.containsSensitiveData ? '#FF3B30' : '#1A7F37' }}>
                  {privacyAnalysis.privacyAnalysis.containsSensitiveData ? 'Sensitive Data Detected' : 'Safe to Send'}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#1D1D1F', mt: 1, fontFamily: 'monospace' }}>
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
