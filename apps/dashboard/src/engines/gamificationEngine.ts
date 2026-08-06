// AI360 Gamification, Leaderboard & Signature Benchmark Engine (Sections 11.4, 11.5.2, 11.5.3)
// Powers enterprise employee leaderboards, departmental proficiency benchmarking, and organizational AI maturity tracking.

export type LeaderboardCategory = 'Top Prompt Writer' | 'Top AI User' | 'Most Improved' | 'Most Efficient';

export interface LeaderboardUser {
  rank: number;
  name: string;
  department: string;
  category: LeaderboardCategory;
  scoreOrMetric: string;
  badgeTitle: string;
  avatarBg: string;
  changeStatus: 'up' | 'down' | 'same';
}

export interface TeamBenchmark {
  teamName: string;
  score: number;       // 0 - 100
  status: 'Elite' | 'Proficient' | 'Developing' | 'Needs Coaching';
  primaryStrength: string;
  improvementFocus: string;
}

export interface MaturityLevel {
  levelNumber: 1 | 2 | 3 | 4;
  levelName: 'No AI' | 'Occasional' | 'Productive' | 'AI Native';
  description: string;
  quarterAchieved: string;
  status: 'Completed' | 'Active' | 'Future Goal';
  keyMilestone: string;
}

/**
 * Section 11.4 Gamification & Leaderboard Rankings across four core categories
 */
export const LEADERBOARD_RANKINGS: Record<LeaderboardCategory, LeaderboardUser[]> = {
  'Top Prompt Writer': [
    { rank: 1, name: 'Aarav Sharma', department: 'Engineering', category: 'Top Prompt Writer', scoreOrMetric: '98.4 Avg Score', badgeTitle: '🏆 Master Prompter', avatarBg: '#7b2cbf', changeStatus: 'up' },
    { rank: 2, name: 'Sarah Jenkins', department: 'Product', category: 'Top Prompt Writer', scoreOrMetric: '95.2 Avg Score', badgeTitle: '⚡ Prompt Strategist', avatarBg: '#20c997', changeStatus: 'same' },
    { rank: 3, name: 'Priyanka Patel', department: 'Marketing', category: 'Top Prompt Writer', scoreOrMetric: '93.8 Avg Score', badgeTitle: '🎯 Context Wizard', avatarBg: '#ed6c02', changeStatus: 'up' },
  ],
  'Top AI User': [
    { rank: 1, name: 'David Chen', department: 'Engineering', category: 'Top AI User', scoreOrMetric: '142 Tasks / wk', badgeTitle: '🚀 AI Powerhouse', avatarBg: '#0077b6', changeStatus: 'same' },
    { rank: 2, name: 'Megha Rao', department: 'Data & Analytics', category: 'Top AI User', scoreOrMetric: '128 Tasks / wk', badgeTitle: '⚙️ Automation Lead', avatarBg: '#9d4edd', changeStatus: 'up' },
    { rank: 3, name: 'Carlos Rodriguez', department: 'Sales', category: 'Top AI User', scoreOrMetric: '115 Tasks / wk', badgeTitle: '📈 Deal Accelerator', avatarBg: '#ff2c55', changeStatus: 'down' },
  ],
  'Most Improved': [
    { rank: 1, name: 'Rohan Gupta', department: 'QA Engineering', category: 'Most Improved', scoreOrMetric: '+28% rubric jump', badgeTitle: '🌱 Growth Hero', avatarBg: '#43a047', changeStatus: 'up' },
    { rank: 2, name: 'Elena Rostova', department: 'HR & Ops', category: 'Most Improved', scoreOrMetric: '+22% rubric jump', badgeTitle: '🔥 Rising Star', avatarBg: '#f59e0b', changeStatus: 'up' },
    { rank: 3, name: 'Kenji Sato', department: 'Finance', category: 'Most Improved', scoreOrMetric: '+18% rubric jump', badgeTitle: '📚 Quick Learner', avatarBg: '#60a5fa', changeStatus: 'same' },
  ],
  'Most Efficient': [
    { rank: 1, name: 'Ananya Deshmukh', department: 'Backend Engineering', category: 'Most Efficient', scoreOrMetric: '$0.02 / task avg', badgeTitle: '💎 FinOps Champion', avatarBg: '#10b981', changeStatus: 'up' },
    { rank: 2, name: 'Liam O’Connor', department: 'Cloud Infra', category: 'Most Efficient', scoreOrMetric: '$0.03 / task avg', badgeTitle: '🛡️ Token Optimizer', avatarBg: '#6366f1', changeStatus: 'same' },
    { rank: 3, name: 'Zahra Al-Mansoor', department: 'Customer Success', category: 'Most Efficient', scoreOrMetric: '$0.04 / task avg', badgeTitle: '🎯 Precision Exec', avatarBg: '#d946ef', changeStatus: 'up' },
  ],
};

/**
 * Section 11.5.2 Signature Differentiator: Team AI Benchmark
 */
export const TEAM_BENCHMARKS: TeamBenchmark[] = [
  { teamName: 'Backend', score: 92, status: 'Elite', primaryStrength: 'Optimal multi-model routing to Claude & Flash with zero prompt bloat', improvementFocus: 'Maintain high token reuse & caching' },
  { teamName: 'DevOps', score: 88, status: 'Elite', primaryStrength: 'High automated script synthesis and infrastructure triage efficiency', improvementFocus: 'Expand runbook generation templates' },
  { teamName: 'Frontend', score: 84, status: 'Proficient', primaryStrength: 'Strong React & UI component test Generation via Claude 3.5 Sonnet', improvementFocus: 'Reduce redundant CSS style context repetitions' },
  { teamName: 'QA', score: 67, status: 'Needs Coaching', primaryStrength: 'Good manual test scenario ideation', improvementFocus: 'Adopt structured Few-Shot prompt templates to elevate automated test script accuracy' },
];

/**
 * Section 11.5.3 Signature Differentiator: AI Maturity Score & 4-Level Ladder
 */
export const MATURITY_LADDER: MaturityLevel[] = [
  { levelNumber: 1, levelName: 'No AI', description: 'Zero structured generative AI tools; ad-hoc manual workflows only.', quarterAchieved: 'Q1 2024', status: 'Completed', keyMilestone: 'Baseline audit established' },
  { levelNumber: 2, levelName: 'Occasional', description: 'Individual experimentation with public chat tools without central governance or token budget control.', quarterAchieved: 'Q2 2024', status: 'Completed', keyMilestone: 'Initial interest & demand identified' },
  { levelNumber: 3, levelName: 'Productive', description: 'Standardized departmental usage with shared prompt libraries and active manager analytics.', quarterAchieved: 'Q3 2024', status: 'Completed', keyMilestone: '80% workforce onboarded to AI360' },
  { levelNumber: 4, levelName: 'AI Native', description: 'Full autonomous multi-model routing, FinOps ROI attribution, enterprise privacy guardrails, and proactive AI recommendations.', quarterAchieved: 'Current (Q4)', status: 'Active', keyMilestone: 'Stage 4 AI Native Enterprise achieved (86/100 Score)' },
];
