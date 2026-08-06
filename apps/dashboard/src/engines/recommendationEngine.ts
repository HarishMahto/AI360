// AI360 AI Recommendation Engine (Section 11.2)
// Maps task type to the most cost-effective capable AI model and provides intelligent suggestions.

export interface ModelRecommendation {
  taskType: 'Summarization' | 'Code Generation' | 'Complex Reasoning' | 'Data Extraction' | 'General Conversation';
  recommendedModel: 'Gemini Flash' | 'Claude' | 'GPT-5' | 'Gemini 1.5 Pro';
  reasoning: string;
  estimatedCostPer1kTokens: number; // in INR / USD cents
  latencyMs: number;
  costSavingsPercent: number;
}

export interface SmartSuggestions {
  promptImprovements: string[];
  costReductionTips: string[];
  learningRecommendations: { course: string; skillTarget: string; duration: string }[];
  departmentRecommendations: { targetTeam: string; advice: string; projectedImpact: string }[];
}

/**
 * Evaluates task signals and maps to optimal model per Section 11.2 Routing Rules
 */
export function getModelRecommendation(taskOrPrompt: string): ModelRecommendation {
  const text = taskOrPrompt.toLowerCase();
  
  if (text.includes('code') || text.includes('function') || text.includes('bug') || text.includes('refactor') || text.includes('java') || text.includes('react') || text.includes('python')) {
    return {
      taskType: 'Code Generation',
      recommendedModel: 'Claude',
      reasoning: 'Claude excels at structured syntax generation, deep semantic refactoring, and multi-file code consistency with superior reasoning over code structures.',
      estimatedCostPer1kTokens: 0.24,
      latencyMs: 850,
      costSavingsPercent: 42,
    };
  }

  if (text.includes('why') || text.includes('analyze') || text.includes('compare') || text.includes('strategy') || text.includes('architecture') || text.includes('reasoning') || text.includes('complex')) {
    return {
      taskType: 'Complex Reasoning',
      recommendedModel: 'GPT-5',
      reasoning: 'GPT-5 provides unmatched deep multi-step deduction, comprehensive synthesis of ambiguous edge cases, and high-fidelity enterprise decision modeling.',
      estimatedCostPer1kTokens: 0.60,
      latencyMs: 1200,
      costSavingsPercent: 25,
    };
  }

  // Default to Summarization & General via Gemini Flash per routing rules
  return {
    taskType: 'Summarization',
    recommendedModel: 'Gemini Flash',
    reasoning: 'Gemini Flash provides industry-leading ultra-fast latency and disruptive cost-efficiency for summarization, document QA, and standard workflow tasks.',
    estimatedCostPer1kTokens: 0.05,
    latencyMs: 280,
    costSavingsPercent: 78,
  };
}

/**
 * Returns automated coaching and recommendations across all 4 pillars of Section 11.2
 */
export function getSmartRecommendations(deptName = 'Engineering'): SmartSuggestions {
  return {
    promptImprovements: [
      'Use structured role framing ("Act as an experienced Enterprise Systems Architect...") to increase initial accuracy by ~35%.',
      'Replace vague adjectives ("fast", "good") with exact SLA targets and quantitative acceptance criteria.',
      'Employ Few-Shot Prompting by including 2 reference examples of desired input vs formatted output.',
    ],
    costReductionTips: [
      'Route routine daily Jira ticket summarization to Gemini Flash instead of GPT-5 to reduce API consumption costs by 78%.',
      'Implement prompt token caching for repeating context headers (e.g. standard product specs and compliance rules).',
      'Use AI360 Token Optimizer to prune redundant whitespace and verbose background sentences prior to API transmission.',
    ],
    learningRecommendations: [
      { course: 'Advanced Zero-Shot Chain-of-Thought Reasoning', skillTarget: 'Complex Problem Solving', duration: '45 mins' },
      { course: 'Enterprise Prompt Privacy & Guardrail Mastery', skillTarget: 'Data Security & Compliance', duration: '30 mins' },
      { course: 'Multi-Model Routing & Token FinOps Best Practices', skillTarget: 'Cost Optimization', duration: '60 mins' },
    ],
    departmentRecommendations: [
      {
        targetTeam: 'Engineering',
        advice: 'Shift 85% of automated git pull request review bots from GPT-5 to Claude to improve syntax critique quality while lowering spend.',
        projectedImpact: '+$1,450 / mo saved & +14% faster PR turnaround',
      },
      {
        targetTeam: 'Customer Support & Operations',
        advice: 'Migrate ticket triage and email summarization pipelines exclusively to Gemini Flash.',
        projectedImpact: '+$2,800 / mo saved with sub-300ms response SLAs',
      },
      {
        targetTeam: 'QA & Test Engineering',
        advice: 'Adopt standardized Playwright/Jest testing prompt templates from the AI360 Prompt Marketplace to elevate team quality score from 67 to 85+.',
        projectedImpact: '+32% faster automated test suite generation',
      },
    ],
  };
}
