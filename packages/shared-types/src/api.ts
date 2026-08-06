/**
 * AI360 – API Contract Types
 * Request/Response interfaces for all REST endpoints.
 * These types serve as the contract between frontend and backend.
 */

import type { LoginRequest, LoginResponse, ChatRequest, ChatResponse, PromptScore, PromptOptimizeResponse, EmployeeAnalytics, DepartmentAnalytics, Recommendation, Forecast, Notification, EmployeeDashboardPayload, ManagerDashboardPayload } from './schemas.js';
import { PromptCategory, AIModel, ReportType, ReportFormat } from './enums.js';
import { z } from 'zod';

// ─── Generic API types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

// ─── Auth endpoints ──────────────────────────────────────────────────────────
// POST /auth/login
export type AuthLoginRequest = LoginRequest;
export type AuthLoginResponse = ApiResponse<LoginResponse>;

// ─── Chat endpoints ──────────────────────────────────────────────────────────
// POST /chat
export type ChatSendRequest = ChatRequest;
export type ChatSendResponse = ApiResponse<ChatResponse>;

// GET /chat/history
export interface ChatHistoryParams {
  page?: number;
  pageSize?: number;
  category?: PromptCategory;
  startDate?: string;
  endDate?: string;
}
export type ChatHistoryResponse = PaginatedResponse<{
  id: string;
  prompt: string;
  response: string;
  model: AIModel;
  promptScore: number;
  category: PromptCategory;
  estimatedCostUSD: number;
  totalTokens: number;
  latencyMs: number;
  timestamp: string;
}>;

// ─── Prompt endpoints ────────────────────────────────────────────────────────
// POST /prompt/score
export interface PromptScoreRequest { prompt: string; }
export type PromptScoreResponse = ApiResponse<PromptScore>;

// POST /prompt/optimize
export interface PromptOptimizeRequest { prompt: string; category?: PromptCategory; }
export type PromptOptimizeApiResponse = ApiResponse<PromptOptimizeResponse>;

// POST /prompt/classify
export interface PromptClassifyRequest { prompt: string; }
export type PromptClassifyResponse = ApiResponse<{ category: PromptCategory; confidence: number; }>;

// ─── Analytics endpoints ─────────────────────────────────────────────────────
export interface AnalyticsParams {
  period?: '7d' | '30d' | '90d';
  startDate?: string;
  endDate?: string;
}

export type EmployeeAnalyticsResponse = ApiResponse<{
  daily: EmployeeAnalytics[];
  summary: EmployeeAnalytics;
}>;

export type DepartmentAnalyticsResponse = ApiResponse<{
  daily: DepartmentAnalytics[];
  summary: DepartmentAnalytics;
  memberBreakdown: Array<{ userId: string; displayName: string; stats: Partial<EmployeeAnalytics> }>;
}>;

// ─── Dashboard endpoints ─────────────────────────────────────────────────────
export type EmployeeDashboardResponse = ApiResponse<EmployeeDashboardPayload>;
export type ManagerDashboardResponse = ApiResponse<ManagerDashboardPayload>;
export type ExecutiveDashboardResponse = ApiResponse<{
  orgSpendUSD: number;
  orgSpendTrend: Array<{ date: string; costUSD: number }>;
  roiEstimate: { hoursSaved: number; dollarValueSaved: number; costRatio: number };
  departmentRanking: Array<{ departmentId: string; name: string; adoptionScore: number; efficiencyScore: number; costUSD: number }>;
  forecast: Forecast;
  totalActiveUsers: number;
  avgPromptScore: number;
}>;

// ─── Recommendations ─────────────────────────────────────────────────────────
export type RecommendationsResponse = ApiResponse<Recommendation[]>;

// ─── Forecast ────────────────────────────────────────────────────────────────
export interface ForecastParams { period?: '7d' | '30d' | '90d'; }
export type ForecastResponse = ApiResponse<Forecast>;

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface ReportParams {
  format: ReportFormat;
  period?: string;
  startDate?: string;
  endDate?: string;
}
