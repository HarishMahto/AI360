/**
 * AI360 – Shared Zod Schemas
 * Single source of truth for data shapes used across all apps.
 */
import { z } from 'zod';
import { UserRole, AIProvider, AIModel, PromptCategory, RecommendationType, Priority, SensitiveDataType, NotificationType } from './enums.js';

// ─── User & Auth ────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().url().optional(),
  role: z.nativeEnum(UserRole),
  organizationId: z.string(),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginRequestSchema = z.object({
  idToken: z.string().min(1, 'Firebase ID token is required'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ─── Organization ────────────────────────────────────────────────────────────

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().url().optional(),
  adminEmail: z.string().email(),
  totalBudgetUSD: z.number().nonnegative().optional(),
  aiProviders: z.array(z.nativeEnum(AIProvider)).default([]),
  defaultModel: z.nativeEnum(AIModel).default(AIModel.GPT_4O_MINI),
  policies: z.object({
    piiDetectionEnabled: z.boolean().default(true),
    promptOptimizationEnabled: z.boolean().default(true),
    maxDailyTokensPerUser: z.number().optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const DepartmentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  managerId: z.string().optional(),
  monthlyBudgetUSD: z.number().nonnegative().optional(),
  createdAt: z.string().datetime(),
});
export type Department = z.infer<typeof DepartmentSchema>;

export const TeamSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  departmentId: z.string(),
  name: z.string(),
  managerId: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type Team = z.infer<typeof TeamSchema>;

// ─── Prompt & Chat ───────────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  model: z.nativeEnum(AIModel).default(AIModel.GPT_4O_MINI),
  stream: z.boolean().default(false),
  projectId: z.string().optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  model: z.nativeEnum(AIModel),
  provider: z.nativeEnum(AIProvider),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  estimatedCostUSD: z.number(),
  latencyMs: z.number(),
  promptScore: z.number().min(0).max(100).optional(),
  promptCategory: z.nativeEnum(PromptCategory).optional(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// ─── Prompt Intelligence ─────────────────────────────────────────────────────

export const PromptScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  context: z.number().min(0).max(100),
  specificity: z.number().min(0).max(100),
  structure: z.number().min(0).max(100),
  constraints: z.number().min(0).max(100),
  outputFormat: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
});
export type PromptScore = z.infer<typeof PromptScoreSchema>;

export const SensitiveDataFindingSchema = z.object({
  type: z.nativeEnum(SensitiveDataType),
  maskedValue: z.string(),
  startIndex: z.number(),
  endIndex: z.number(),
});
export type SensitiveDataFinding = z.infer<typeof SensitiveDataFindingSchema>;

export const PromptScoreRequestSchema = z.object({
  prompt: z.string().min(1),
});

export const PromptOptimizeRequestSchema = z.object({
  prompt: z.string().min(1),
  category: z.nativeEnum(PromptCategory).optional(),
});

export const PromptOptimizeResponseSchema = z.object({
  originalPrompt: z.string(),
  optimizedPrompt: z.string(),
  originalScore: PromptScoreSchema,
  estimatedImprovement: z.number(),
  rewrites: z.object({
    professional: z.string(),
    detailed: z.string(),
    concise: z.string(),
    technical: z.string(),
    business: z.string(),
  }),
  sensitiveDataFindings: z.array(SensitiveDataFindingSchema),
});
export type PromptOptimizeResponse = z.infer<typeof PromptOptimizeResponseSchema>;

// ─── Usage & Telemetry ───────────────────────────────────────────────────────

export const UsageRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  projectId: z.string().optional(),
  prompt: z.string(),
  optimizedPrompt: z.string().optional(),
  response: z.string(),
  category: z.nativeEnum(PromptCategory),
  promptScore: z.number().min(0).max(100),
  model: z.nativeEnum(AIModel),
  provider: z.nativeEnum(AIProvider),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  estimatedCostUSD: z.number(),
  latencyMs: z.number(),
  timestamp: z.string().datetime(),
});
export type UsageRecord = z.infer<typeof UsageRecordSchema>;

// ─── Analytics ───────────────────────────────────────────────────────────────

export const EmployeeAnalyticsSchema = z.object({
  userId: z.string(),
  date: z.string(), // YYYY-MM-DD
  totalRequests: z.number(),
  totalInputTokens: z.number(),
  totalOutputTokens: z.number(),
  totalTokens: z.number(),
  totalCostUSD: z.number(),
  avgPromptScore: z.number(),
  avgLatencyMs: z.number(),
  categoriesUsed: z.record(z.nativeEnum(PromptCategory), z.number()),
  modelsUsed: z.record(z.nativeEnum(AIModel), z.number()),
  adoptionScore: z.number().min(0).max(100),
  efficiencyScore: z.number().min(0).max(100),
});
export type EmployeeAnalytics = z.infer<typeof EmployeeAnalyticsSchema>;

export const DepartmentAnalyticsSchema = z.object({
  departmentId: z.string(),
  organizationId: z.string(),
  date: z.string(),
  totalRequests: z.number(),
  totalTokens: z.number(),
  totalCostUSD: z.number(),
  avgPromptScore: z.number(),
  activeUsers: z.number(),
  adoptionScore: z.number().min(0).max(100),
  efficiencyScore: z.number().min(0).max(100),
  categoriesUsed: z.record(z.string(), z.number()),
  modelsUsed: z.record(z.string(), z.number()),
});
export type DepartmentAnalytics = z.infer<typeof DepartmentAnalyticsSchema>;

// ─── Recommendations ─────────────────────────────────────────────────────────

export const RecommendationSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(RecommendationType),
  priority: z.nativeEnum(Priority),
  targetId: z.string(), // userId, departmentId, or organizationId
  targetType: z.enum(['employee', 'department', 'organization']),
  title: z.string(),
  description: z.string(),
  estimatedSavingsUSD: z.number().optional(),
  actionLabel: z.string().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

// ─── Forecast ────────────────────────────────────────────────────────────────

export const ForecastPointSchema = z.object({
  date: z.string(),
  predictedCostUSD: z.number(),
  lowerBound: z.number(),
  upperBound: z.number(),
});

export const ForecastSchema = z.object({
  id: z.string(),
  targetId: z.string(),
  targetType: z.enum(['employee', 'department', 'organization']),
  generatedAt: z.string().datetime(),
  forecast7d: z.array(ForecastPointSchema),
  forecast30d: z.array(ForecastPointSchema),
  forecast90d: z.array(ForecastPointSchema),
  monthlyBudgetUSD: z.number().optional(),
  budgetExceededDate: z.string().optional(),
});
export type Forecast = z.infer<typeof ForecastSchema>;

// ─── Notifications ───────────────────────────────────────────────────────────

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(Priority),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean().default(false),
  actionUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type Notification = z.infer<typeof NotificationSchema>;

// ─── Dashboard Payloads ──────────────────────────────────────────────────────

export const EmployeeDashboardPayloadSchema = z.object({
  todayStats: z.object({
    requests: z.number(),
    inputTokens: z.number(),
    outputTokens: z.number(),
    totalTokens: z.number(),
    costUSD: z.number(),
    avgPromptScore: z.number(),
  }),
  weekStats: z.object({
    requests: z.number(),
    totalTokens: z.number(),
    costUSD: z.number(),
    avgPromptScore: z.number(),
  }),
  adoptionScore: z.number(),
  efficiencyScore: z.number(),
  recentHistory: z.array(UsageRecordSchema),
  recommendations: z.array(RecommendationSchema),
  categoryBreakdown: z.record(z.string(), z.number()),
  dailyTrend: z.array(z.object({ date: z.string(), costUSD: z.number(), tokens: z.number() })),
});
export type EmployeeDashboardPayload = z.infer<typeof EmployeeDashboardPayloadSchema>;

export const ManagerDashboardPayloadSchema = z.object({
  todaySpendUSD: z.number(),
  monthSpendUSD: z.number(),
  teamAdoptionScore: z.number(),
  teamEfficiencyScore: z.number(),
  teamMembers: z.array(z.object({
    userId: z.string(),
    displayName: z.string(),
    todayRequests: z.number(),
    todayTokens: z.number(),
    todayCostUSD: z.number(),
    avgPromptScore: z.number(),
    adoptionScore: z.number(),
  })),
  costTrend: z.array(z.object({ date: z.string(), costUSD: z.number() })),
  categoryBreakdown: z.record(z.string(), z.number()),
  modelUsage: z.record(z.string(), z.number()),
  recommendations: z.array(RecommendationSchema),
  forecast: ForecastSchema.optional(),
});
export type ManagerDashboardPayload = z.infer<typeof ManagerDashboardPayloadSchema>;
