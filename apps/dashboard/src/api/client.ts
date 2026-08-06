// AI360 Dashboard – Axios API Client
// Configured with JWT interceptor, base URL, and error handling
import axios, { AxiosError } from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? 'https://ai-360-dashboard.vercel.app' : 'http://localhost:8000');

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ai360_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ai360_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Typed API methods ────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: (idToken: string) => apiClient.post('/auth/login', { id_token: idToken }),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),

  // Chat
  sendChat: (data: object) => apiClient.post('/chat', data),
  getChatHistory: (params?: object) => apiClient.get('/chat/history', { params }),

  // Prompt Intelligence
  scorePrompt: (prompt: string) => apiClient.post('/prompt/score', { prompt }),
  optimizePrompt: (prompt: string, category?: string) => apiClient.post('/prompt/optimize', { prompt, category }),
  classifyPrompt: (prompt: string) => apiClient.post('/prompt/classify', { prompt }),
  checkPromptPrivacy: (prompt: string, targetModel?: string) =>
    apiClient.post('/prompt/privacy-layer', { prompt, allow_full_prompt_storage: false, target_model: targetModel || 'gemini-1.5-flash' }),

  // Section 11.5 Signature Enterprise Models
  getCostAdvisor: () => apiClient.get('/finops/cost-advisor'),
  getTeamBenchmarks: () => apiClient.get('/analytics/team-benchmarks'),
  getMaturityScore: () => apiClient.get('/analytics/maturity-score'),

  // Section 11.2, 11.3, 11.4 Enterprise AI Engines
  evaluateModelRouting: (taskOrPrompt: string) => apiClient.post('/recommendations/model-routing', { task_or_prompt: taskOrPrompt }),
  getSmartSuggestions: (department = 'Engineering') => apiClient.get('/recommendations/smart-suggestions', { params: { department } }),
  calculateROI: (hoursSaved = 1250, hourlyCostRate = 60, aiCostIncurred = 15800) =>
    apiClient.post('/finops/roi-calculator', { hours_saved: hoursSaved, hourly_cost_rate: hourlyCostRate, ai_cost_incurred: aiCostIncurred }),
  getOLSRegression: (historicalCosts = [1200, 1450, 1580, 1720, 1890, 2100]) =>
    apiClient.post('/forecast/ols-regression', { historical_costs: historicalCosts }),
  getLeaderboards: () => apiClient.get('/analytics/leaderboards'),

  // Analytics
  getEmployeeAnalytics: (params?: object) => apiClient.get('/analytics/employee', { params }),
  getTeamAnalytics: (params?: object) => apiClient.get('/analytics/team', { params }),
  getDepartmentAnalytics: (params?: object) => apiClient.get('/analytics/department', { params }),
  getOrgAnalytics: (params?: object) => apiClient.get('/analytics/organization', { params }),

  // Dashboards
  getEmployeeDashboard: () => apiClient.get('/dashboard/employee'),
  getManagerDashboard: () => apiClient.get('/dashboard/manager'),
  getExecutiveDashboard: () => apiClient.get('/dashboard/executive'),

  // Recommendations
  getRecommendations: () => apiClient.get('/recommendations'),

  // Forecast
  getForecast: (params?: object) => apiClient.get('/forecast', { params }),

  // Section 10.2 Employee Dashboard AI Engine & Firebase
  getPromptCoach: (prompt: string, model = 'gemini-1.5-flash') => apiClient.post('/prompt/coach', { prompt, model }),
  getModelRecommendations: (currentModel = 'GPT-5 (general use)', taskType = 'Summarization') =>
    apiClient.get('/prompt/model-recommendations', { params: { current_model: currentModel, task_type: taskType } }),
  getPromptHistory: (query?: string, favoriteOnly = false) =>
    apiClient.get('/prompt/history', { params: { query, favorite_only: favoriteOnly } }),
  savePromptHistory: (title: string, promptText: string, category = 'CODING', promptScore = 82, isFavorite = true) =>
    apiClient.post('/prompt/history', { title, prompt_text: promptText, category, prompt_score: promptScore, is_favorite: isFavorite }),
  toggleFavoritePrompt: (promptId: string) => apiClient.put(`/prompt/history/${promptId}/favorite`),
  getPromptMarketplace: (category?: string) => apiClient.get('/prompt/marketplace', { params: { category } }),
  publishToMarketplace: (promptId: string) => apiClient.post(`/prompt/marketplace/${promptId}/publish`),
  getLearningCoachTips: () => apiClient.get('/prompt/learning-coach'),
  getSessionSummary: () => apiClient.get('/prompt/session-summary'),

  // Licenses
  getUnusedLicenses: () => apiClient.get('/finops/licenses/unused'),
  reallocateLicense: (seatId: string) => apiClient.post(`/finops/licenses/${seatId}/reallocate`),
  reallocateAllInactiveLicenses: () => apiClient.post('/finops/licenses/reallocate-all'),

  // Reports
  getReportsList: (scope: string) => apiClient.get('/reports', { params: { scope } }),
  downloadReport: (type: string, format: string, params?: object) =>
    apiClient.get(`/reports/${type}`, { params: { format, ...params }, responseType: 'blob' }),
  generateReport: (type: string, format: string) => apiClient.post(`/reports/${type}/generate`, { format }),

  // Executive actions
  approveInitiative: (initiativeId: string, title: string) =>
    apiClient.post('/recommendations/executive/approve', { initiative_id: initiativeId, title }),
  enableAutoSwitching: () => apiClient.post('/recommendations/executive/enable-auto-switching'),

  // Health
  health: () => apiClient.get('/health'),
};
