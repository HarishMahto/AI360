// AI360 – TanStack Query hooks with graceful fallback error handling
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import {
  MORNING_COST_ADVISOR, TEAM_BENCHMARKS, MATURITY_LADDER,
  LEADERBOARD_RANKINGS, calculateROI, generateOLSForecast,
  getSmartRecommendations, getModelRecommendation
} from '../engines';

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const QueryKeys = {
  employeeDashboard: ['dashboard', 'employee'] as const,
  managerDashboard: ['dashboard', 'manager'] as const,
  executiveDashboard: ['dashboard', 'executive'] as const,
  chatHistory: (params?: object) => ['chat', 'history', params] as const,
  employeeAnalytics: (params?: object) => ['analytics', 'employee', params] as const,
  teamAnalytics: (params?: object) => ['analytics', 'team', params] as const,
  departmentAnalytics: (params?: object) => ['analytics', 'department', params] as const,
  orgAnalytics: (params?: object) => ['analytics', 'organization', params] as const,
  recommendations: ['recommendations'] as const,
  forecast: (params?: object) => ['forecast', params] as const,
  me: ['auth', 'me'] as const,
  costAdvisor: ['finops', 'costAdvisor'] as const,
  teamBenchmarks: ['analytics', 'teamBenchmarks'] as const,
  maturityScore: ['analytics', 'maturityScore'] as const,
};

// ─── Dashboard Hooks ─────────────────────────────────────────────────────────

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: QueryKeys.employeeDashboard,
    queryFn: () => api.getEmployeeDashboard().then((r) => r.data).catch(() => null),
    staleTime: 60_000,
    retry: false,
  });
}

export function useManagerDashboard() {
  return useQuery({
    queryKey: QueryKeys.managerDashboard,
    queryFn: () => api.getManagerDashboard().then((r) => r.data).catch(() => null),
    staleTime: 60_000,
    retry: false,
  });
}

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: QueryKeys.executiveDashboard,
    queryFn: () => api.getExecutiveDashboard().then((r) => r.data).catch(() => null),
    staleTime: 2 * 60_000,
    retry: false,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'admin'] as const,
    queryFn: () => api.getExecutiveDashboard().then((r) => r.data).catch(() => null),
    staleTime: 2 * 60_000,
    retry: false,
  });
}

// ─── Chat Hooks ──────────────────────────────────────────────────────────────

export function useChatHistory(params?: { page?: number; pageSize?: number; category?: string }) {
  return useQuery({
    queryKey: QueryKeys.chatHistory(params),
    queryFn: () => api.getChatHistory(params).then((r) => r.data).catch(() => null),
    staleTime: 30_000,
    retry: false,
  });
}

export function useSendChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: object) => api.sendChat(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.chatHistory() });
      qc.invalidateQueries({ queryKey: QueryKeys.employeeDashboard });
    },
  });
}

// ─── Prompt Intelligence Hooks ────────────────────────────────────────────────

export function useScorePrompt() {
  return useMutation({
    mutationFn: (prompt: string) => api.scorePrompt(prompt).then((r) => r.data.data),
  });
}

export function useOptimizePrompt() {
  return useMutation({
    mutationFn: ({ prompt, category }: { prompt: string; category?: string }) =>
      api.optimizePrompt(prompt, category).then((r) => r.data.data),
  });
}

export function useClassifyPrompt() {
  return useMutation({
    mutationFn: (prompt: string) => api.classifyPrompt(prompt).then((r) => r.data.data),
  });
}

// ─── Analytics Hooks ─────────────────────────────────────────────────────────

export function useEmployeeAnalytics(params?: { period?: '7d' | '30d' | '90d' }) {
  return useQuery({
    queryKey: QueryKeys.employeeAnalytics(params),
    queryFn: () => api.getEmployeeAnalytics(params).then((r) => r.data.data).catch(() => null),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useTeamAnalytics(params?: object) {
  return useQuery({
    queryKey: QueryKeys.teamAnalytics(params),
    queryFn: () => api.getTeamAnalytics(params).then((r) => r.data.data).catch(() => null),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useDepartmentAnalytics(params?: object) {
  return useQuery({
    queryKey: QueryKeys.departmentAnalytics(params),
    queryFn: () => api.getDepartmentAnalytics(params).then((r) => r.data.data).catch(() => null),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useOrgAnalytics(params?: object) {
  return useQuery({
    queryKey: QueryKeys.orgAnalytics(params),
    queryFn: () => api.getOrgAnalytics(params).then((r) => r.data.data).catch(() => null),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

// ─── Recommendations & Forecast ──────────────────────────────────────────────

export function useRecommendations() {
  return useQuery({
    queryKey: QueryKeys.recommendations,
    queryFn: () => api.getRecommendations().then((r) => r.data.data).catch(() => null),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

export function useForecast(params?: { period?: '7d' | '30d' | '90d' }) {
  return useQuery({
    queryKey: QueryKeys.forecast(params),
    queryFn: () => api.getForecast(params).then((r) => r.data.data).catch(() => null),
    staleTime: 60 * 60_000,
    retry: false,
  });
}

// ─── Section 11.5 Signature Enterprise Hooks ──────────────────────────────────

export function useCostAdvisor() {
  return useQuery({
    queryKey: ['finops', 'costAdvisor'] as const,
    queryFn: () => api.getCostAdvisor().then((r) => r.data).catch(() => MORNING_COST_ADVISOR),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: MORNING_COST_ADVISOR,
  });
}

export function useTeamBenchmarks() {
  return useQuery({
    queryKey: ['analytics', 'teamBenchmarks'] as const,
    queryFn: () => api.getTeamBenchmarks().then((r) => r.data).catch(() => TEAM_BENCHMARKS),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: TEAM_BENCHMARKS,
  });
}

export function useMaturityScore() {
  return useQuery({
    queryKey: ['analytics', 'maturityScore'] as const,
    queryFn: () =>
      api.getMaturityScore().then((r) => r.data).catch(() => ({
        current_level: 4,
        current_level_name: 'AI Native',
        maturity_index: 86,
        ladder: MATURITY_LADDER,
      })),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: {
      current_level: 4,
      current_level_name: 'AI Native',
      maturity_index: 86,
      ladder: MATURITY_LADDER,
    },
  });
}

export function usePromptPrivacy() {
  return useMutation({
    mutationFn: ({ prompt, targetModel }: { prompt: string; targetModel?: string }) =>
      api.checkPromptPrivacy(prompt, targetModel).then((r) => r.data),
  });
}

// ─── Section 11.2, 11.3, 11.4 Enterprise Engine Hooks ──────────────────────────

export function useLeaderboards() {
  return useQuery({
    queryKey: ['analytics', 'leaderboards'] as const,
    queryFn: () =>
      api.getLeaderboards().then((r) => {
        const data = r.data;
        return {
          'Top Prompt Writer': data.top_prompt_writer.map((u: any) => ({ ...u, scoreOrMetric: u.score_or_metric, badgeTitle: u.badge_title, avatarBg: u.avatar_bg, changeStatus: u.change_status })),
          'Top AI User': data.top_ai_user.map((u: any) => ({ ...u, scoreOrMetric: u.score_or_metric, badgeTitle: u.badge_title, avatarBg: u.avatar_bg, changeStatus: u.change_status })),
          'Most Improved': data.most_improved.map((u: any) => ({ ...u, scoreOrMetric: u.score_or_metric, badgeTitle: u.badge_title, avatarBg: u.avatar_bg, changeStatus: u.change_status })),
          'Most Efficient': data.most_efficient.map((u: any) => ({ ...u, scoreOrMetric: u.score_or_metric, badgeTitle: u.badge_title, avatarBg: u.avatar_bg, changeStatus: u.change_status })),
        };
      }).catch(() => LEADERBOARD_RANKINGS),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: LEADERBOARD_RANKINGS,
  });
}

export function useROICalculator(hoursSaved = 1250, hourlyCostRate = 60, aiCostIncurred = 15800) {
  return useQuery({
    queryKey: ['finops', 'roi', hoursSaved, hourlyCostRate, aiCostIncurred] as const,
    queryFn: () =>
      api.calculateROI(hoursSaved, hourlyCostRate, aiCostIncurred).then((r) => {
        const data = r.data;
        return {
          hoursSaved: data.hours_saved,
          hourlyCostRate: data.hourly_cost_rate,
          businessValueGenerated: data.business_value_generated,
          aiCostIncurred: data.ai_cost_incurred,
          netROI: data.net_roi,
          netROIPercentage: data.net_roi_percentage,
          formulaString: data.formula_string,
        };
      }).catch(() => calculateROI(hoursSaved, hourlyCostRate, aiCostIncurred)),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: calculateROI(hoursSaved, hourlyCostRate, aiCostIncurred),
  });
}

export function useOLSRegression(historicalCosts: number[] = [1200, 1450, 1580, 1720, 1890, 2100]) {
  return useQuery({
    queryKey: ['forecast', 'ols', historicalCosts] as const,
    queryFn: () =>
      api.getOLSRegression(historicalCosts).then((r) => {
        const data = r.data;
        return {
          slope: data.slope,
          intercept: data.intercept,
          rSquared: data.r_squared,
          forecastPoints: data.forecast_points.map((p: any) => ({
            dayOrMonth: p.day_or_month,
            historicalCost: p.historical_cost,
            projectedCost: p.projected_cost,
            historicalTokens: p.historical_tokens,
            projectedTokens: p.projected_tokens,
          })),
          roadmapNote: data.roadmap_note,
        };
      }).catch(() => generateOLSForecast(historicalCosts)),
    staleTime: 10 * 60_000,
    retry: false,
    initialData: generateOLSForecast(historicalCosts),
  });
}

export function useSmartSuggestions(department = 'Engineering') {
  return useQuery({
    queryKey: ['recommendations', 'smartSuggestions', department] as const,
    queryFn: () =>
      api.getSmartSuggestions(department).then((r) => {
        const d = r.data;
        return {
          promptImprovements: d.prompt_improvements,
          costReductionTips: d.cost_reduction_tips,
          learningRecommendations: d.learning_recommendations.map((l: any) => ({ course: l.course, skillTarget: l.skill_target, duration: l.duration })),
          departmentRecommendations: d.department_recommendations.map((dep: any) => ({ targetTeam: dep.target_team, advice: dep.advice, projectedImpact: dep.projected_impact })),
        };
      }).catch(() => getSmartRecommendations(department)),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: getSmartRecommendations(department),
  });
}

export function useModelRouting() {
  return useMutation({
    mutationFn: (taskOrPrompt: string) =>
      api.evaluateModelRouting(taskOrPrompt).then((r) => {
        const d = r.data;
        return {
          taskType: d.task_type,
          recommendedModel: d.recommended_model,
          reasoning: d.reasoning,
          estimatedCostPer1kTokens: d.estimated_cost_per_1k_tokens,
          latencyMs: d.latency_ms,
          costSavingsPercent: d.cost_savings_percent,
        };
      }).catch(() => getModelRecommendation(taskOrPrompt)),
  });
}


// ── Section 10.2 Employee Dashboard AI Engine & Firebase Hooks ───────────────

const fallbackPromptCoach = (prompt: string) => ({
  originalPrompt: prompt || 'Write Java API',
  suggestion: 'Add the framework version for a more precise result.',
  optimizedPrompt: 'Generate a Spring Boot 3 REST API using Java 21, JWT authentication, MySQL, and Clean Architecture.',
  scoreOutOf100: 82,
  dimensions: { clarity: 17.0, context: 16.0, specificity: 17.0, format: 16.0, useOfExamples: 16.0, overallScore: 82 },
  tokenOptimizer: { currentTokens: 650, optimizedTokens: 180, savingsPercent: 72, savingsLabel: '72% cheaper' },
});

export function usePromptCoach(prompt = 'Write Java API', model = 'gemini-1.5-flash') {
  return useQuery({
    queryKey: ['promptCoach', prompt, model] as const,
    queryFn: () =>
      api.getPromptCoach(prompt, model).then((r) => {
        const d = r.data;
        return {
          originalPrompt: d.original_prompt,
          suggestion: d.suggestion,
          optimizedPrompt: d.optimized_prompt,
          scoreOutOf100: d.score_out_of_100,
          dimensions: {
            clarity: d.dimensions.clarity,
            context: d.dimensions.context,
            specificity: d.dimensions.specificity,
            format: d.dimensions.format,
            useOfExamples: d.dimensions.use_of_examples,
            overallScore: d.dimensions.overall_score,
          },
          tokenOptimizer: {
            currentTokens: d.token_optimizer.current_tokens,
            optimizedTokens: d.token_optimizer.optimized_tokens,
            savingsPercent: d.token_optimizer.savings_percent,
            savingsLabel: d.token_optimizer.savings_label,
          },
        };
      }).catch(() => fallbackPromptCoach(prompt)),
    staleTime: 60_000,
    retry: false,
    initialData: fallbackPromptCoach(prompt),
  });
}

const fallbackModelRecommendations = () => [
  { signal: 'Task type: Summarization', recommendation: 'Switch to Gemini Flash', estimatedSaving: '~70% cheaper', targetModel: 'gemini-1.5-flash', isReversible: true },
  { signal: 'Current model: GPT-5 (general use)', recommendation: 'Switch to Gemini Flash', estimatedSaving: '~40% cheaper', targetModel: 'gemini-1.5-flash', isReversible: true },
  { signal: 'Task type: Complex Architectural Refactoring', recommendation: 'Use Claude 3.5 Sonnet', estimatedSaving: '~25% lower cost', targetModel: 'claude-3-5-sonnet', isReversible: true },
];

export function useModelRecommendations(currentModel = 'GPT-5 (general use)', taskType = 'Summarization') {
  return useQuery({
    queryKey: ['modelRecommendations', currentModel, taskType] as const,
    queryFn: () =>
      api.getModelRecommendations(currentModel, taskType).then((r) =>
        r.data.map((item: any) => ({
          signal: item.signal,
          recommendation: item.recommendation,
          estimatedSaving: item.estimated_saving,
          targetModel: item.target_model,
          isReversible: item.is_reversible,
        }))
      ).catch(() => fallbackModelRecommendations()),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: fallbackModelRecommendations(),
  });
}

const fallbackPromptHistory = () => [
  { id: 'prompt_sap_spec', userId: 'user_employee_1', title: 'SAP Prompt Spec', promptText: 'Analyze SAP RFC logs and extract key error codes in structured JSON format.', category: 'CODING', promptScore: 98, isFavorite: true, isMarketplaceTemplate: true, usesCount: 520, hoursSaved: 1100.0, createdAt: new Date().toISOString() },
  { id: 'prompt_java_rest', userId: 'user_employee_1', title: 'Spring Boot REST API Generator', promptText: 'Generate a Spring Boot 3 REST API using Java 21, JWT authentication, MySQL, and Clean Architecture.', category: 'CODING', promptScore: 82, isFavorite: true, isMarketplaceTemplate: false, usesCount: 14, hoursSaved: 28.0, createdAt: new Date().toISOString() },
];

export function usePromptHistory(query?: string, favoriteOnly = false) {
  return useQuery({
    queryKey: ['promptHistory', query, favoriteOnly] as const,
    queryFn: () =>
      api.getPromptHistory(query, favoriteOnly).then((r) =>
        r.data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          promptText: item.prompt_text,
          category: item.category,
          promptScore: item.prompt_score,
          isFavorite: item.is_favorite,
          isMarketplaceTemplate: item.is_marketplace_template,
          usesCount: item.uses_count,
          hoursSaved: item.hours_saved,
          createdAt: item.created_at,
        }))
      ).catch(() => {
        let items = fallbackPromptHistory();
        if (favoriteOnly) items = items.filter((i) => i.isFavorite);
        if (query && query.trim()) {
          const q = query.toLowerCase();
          items = items.filter((i) => i.title.toLowerCase().includes(q) || i.promptText.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
        }
        return items;
      }),
    staleTime: 30_000,
    retry: false,
    initialData: fallbackPromptHistory(),
  });
}

const fallbackMarketplace = () => [
  { id: 'mkt_sap_prompt', title: 'SAP Prompt', starRating: 5.0, starDisplay: '★★★★★', usedByCount: 520, hoursSaved: 1100.0, authorTeam: 'Backend Engineering', category: 'CODING', description: 'Used by 520 developers · Saved 1,100 hours across the team', promptTemplate: 'Analyze SAP RFC logs and extract key error codes in structured JSON format.' },
  { id: 'mkt_k8s_yaml', title: 'Kubernetes Deployment Spec', starRating: 4.9, starDisplay: '★★★★★', usedByCount: 412, hoursSaved: 840.0, authorTeam: 'Cloud & DevOps', category: 'ARCHITECTURE', description: 'Used by 412 developers · Saved 840 hours across the team', promptTemplate: 'Generate a production-ready Kubernetes deployment with resource limits, liveness probes, and rolling update strategies.' },
  { id: 'mkt_react_hook', title: 'React TanStack Query Hook Generator', starRating: 4.8, starDisplay: '★★★★★', usedByCount: 389, hoursSaved: 720.0, authorTeam: 'Frontend Guild', category: 'CODING', description: 'Used by 389 developers · Saved 720 hours across the team', promptTemplate: 'Write a comprehensive custom React hook using TanStack Query v5 with automatic background refetching and fallback error boundaries.' },
  { id: 'mkt_sql_opt', title: 'PostgreSQL Query Optimizer', starRating: 4.9, starDisplay: '★★★★★', usedByCount: 460, hoursSaved: 910.0, authorTeam: 'Finance & Ops', category: 'SQL', description: 'Used by 460 developers · Saved 910 hours across the team', promptTemplate: 'Analyze EXPLAIN ANALYZE output for PostgreSQL queries and provide specific composite indexing recommendations.' },
];

export function usePromptMarketplace(category?: string) {
  return useQuery({
    queryKey: ['promptMarketplace', category] as const,
    queryFn: () =>
      api.getPromptMarketplace(category).then((r) =>
        r.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          starRating: item.star_rating,
          starDisplay: item.star_display,
          usedByCount: item.used_by_count,
          hoursSaved: item.hours_saved,
          authorTeam: item.author_team,
          category: item.category,
          description: item.description,
          promptTemplate: item.prompt_template,
        }))
      ).catch(() => {
        const list = fallbackMarketplace();
        if (category && category !== 'ALL') return list.filter((x) => x.category.toUpperCase() === category.toUpperCase());
        return list;
      }),
    staleTime: 2 * 60_000,
    retry: false,
    initialData: fallbackMarketplace(),
  });
}

const fallbackLearningCoach = () => ({
  currentPatternSummary: 'Your prompt specificity has improved by +18% this month. Focusing on framework versions will push your overall average into the Elite (>90) tier.',
  scoreTrajectory: [68, 72, 75, 78, 82],
  tips: [
    { tip: 'Use concrete examples.', description: 'Include brief sample JSON inputs and expected outputs to ground AI model logic.', targetWeakness: 'Observed in recent queries: example utilization score averaged 14/20.' },
    { tip: 'Mention the language or framework version.', description: 'State Java 21, Spring Boot 3, or React 18 explicitly to prevent legacy syntax suggestions.', targetWeakness: 'Observed pattern: framework versions omitted in 64% of architectural prompts.' },
    { tip: 'Specify the desired output format.', description: 'Request Markdown tables, JSON schemas, or step-by-step numbered code blocks.', targetWeakness: 'Observed pattern: unconstrained output formats causing verbose explanations.' },
  ],
});

export function useLearningCoachTips() {
  return useQuery({
    queryKey: ['learningCoachTips'] as const,
    queryFn: () =>
      api.getLearningCoachTips().then((r) => {
        const d = r.data;
        return {
          currentPatternSummary: d.current_pattern_summary,
          scoreTrajectory: d.score_trajectory,
          tips: d.tips.map((t: any) => ({ tip: t.tip, description: t.description, targetWeakness: t.target_weakness })),
        };
      }).catch(() => fallbackLearningCoach()),
    staleTime: 5 * 60_000,
    retry: false,
    initialData: fallbackLearningCoach(),
  });
}

const fallbackSessionSummary = () => ({
  snapshots: [
    { period: 'Live snapshot (mid-day)', prompts: 34, tokens: '—', cost: '$1.32', hoursSaved: 2.3 },
    { period: 'End-of-day summary', prompts: 43, tokens: '8,300', cost: '₹1.80', hoursSaved: 2.8 },
  ],
});

export function useSessionSummary() {
  return useQuery({
    queryKey: ['sessionSummary'] as const,
    queryFn: () =>
      api.getSessionSummary().then((r) => {
        const d = r.data;
        return {
          snapshots: d.snapshots.map((s: any) => ({ period: s.period, prompts: s.prompts, tokens: s.tokens, cost: s.cost, hoursSaved: s.hours_saved })),
        };
      }).catch(() => fallbackSessionSummary()),
    staleTime: 60_000,
    retry: false,
    initialData: fallbackSessionSummary(),
  });
}

export function useToggleFavoritePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (promptId: string) => api.toggleFavoritePrompt(promptId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promptHistory'] }),
  });
}

export function useSaveThenPublishPrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, promptText, category }: { title: string; promptText: string; category?: string }) => {
      const saved = await api.savePromptHistory(title, promptText, category);
      return api.publishToMarketplace(saved.data.id).then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promptHistory'] });
      qc.invalidateQueries({ queryKey: ['promptMarketplace'] });
    },
  });
}

// ─── Licenses ─────────────────────────────────────────────────────────────────

export function useUnusedLicenses() {
  return useQuery({
    queryKey: ['finops', 'unusedLicenses'] as const,
    queryFn: () => api.getUnusedLicenses().then((r) => r.data).catch(() => null),
    staleTime: 60_000,
    retry: false,
  });
}

export function useReallocateLicense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (seatId: string) => api.reallocateLicense(seatId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finops', 'unusedLicenses'] }),
  });
}

export function useReallocateAllInactiveLicenses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.reallocateAllInactiveLicenses().then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['finops', 'unusedLicenses'] }),
  });
}

// ─── Reports & Executive Actions ──────────────────────────────────────────────

export function useReportsList(scope: string) {
  return useQuery({
    queryKey: ['reports', 'list', scope] as const,
    queryFn: () => api.getReportsList(scope).then((r) => r.data).catch(() => null),
    staleTime: 60_000,
    retry: false,
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, format }: { type: string; format: string }) => api.generateReport(type, format).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports', 'list'] }),
  });
}

export function useApproveInitiative() {
  return useMutation({
    mutationFn: ({ initiativeId, title }: { initiativeId: string; title: string }) =>
      api.approveInitiative(initiativeId, title).then((r) => r.data),
  });
}

export function useEnableAutoSwitching() {
  return useMutation({
    mutationFn: () => api.enableAutoSwitching().then((r) => r.data),
  });
}


