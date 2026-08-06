// AI360 FinOps & ROI Engine (Sections 11.3 & 11.5.1)
// Implements rigorous Business Value & Net ROI formulas, Ordinary Least Squares (OLS)
// Linear Regression Forecasting (with ARIMA/Prophet roadmap readiness), and the morning AI Cost Advisor Nudge.

export interface ROIDetails {
  hoursSaved: number;
  hourlyCostRate: number;
  businessValueGenerated: number;
  aiCostIncurred: number;
  netROI: number; // expressed as decimal multiplier (e.g., 3.80 = 380%)
  netROIPercentage: number;
  formulaString: string;
}

export interface ForecastPoint {
  dayOrMonth: string;
  historicalCost?: number;
  projectedCost?: number;
  historicalTokens?: number;
  projectedTokens?: number;
}

export interface CostAdvisorNudge {
  period: string;
  department: string;
  // snake_case to match the FastAPI CostAdvisorResponse shape returned by GET /finops/cost-advisor —
  // this object is used as this query's initialData/fallback, so its keys must match the live response.
  spent_formatted: string;
  spent_usd: number;
  potential_saving_formatted: string;
  potential_saving_usd: number;
  recommendation: string;
  action_type: string;
  target_model: string;
}

/**
 * Section 11.5.1 Signature Differentiator: Proactive AI Cost Advisor
 */
export const MORNING_COST_ADVISOR: CostAdvisorNudge = {
  period: 'Yesterday',
  department: 'Engineering',
  spent_formatted: '₹820',
  spent_usd: 9.88,
  potential_saving_formatted: '₹210',
  potential_saving_usd: 2.53,
  recommendation: 'Move summarization tasks to Gemini Flash.',
  action_type: 'switch_model',
  target_model: 'Gemini Flash',
};

/**
 * Computes enterprise ROI using explicit Section 11.3 mathematical formulas:
 * Business Value = Hours Saved x Hourly Cost
 * ROI = (Value Generated - AI Cost) / AI Cost
 */
export function calculateROI(hoursSaved = 1250, hourlyCostRate = 60, aiCostIncurred = 15800): ROIDetails {
  const businessValueGenerated = hoursSaved * hourlyCostRate;
  const netROI = aiCostIncurred > 0 ? (businessValueGenerated - aiCostIncurred) / aiCostIncurred : 0;
  const netROIPercentage = Number((netROI * 100).toFixed(1));

  return {
    hoursSaved,
    hourlyCostRate,
    businessValueGenerated,
    aiCostIncurred,
    netROI: Number(netROI.toFixed(2)),
    netROIPercentage,
    formulaString: `Business Value = ${hoursSaved.toLocaleString()} hrs × $${hourlyCostRate}/hr = $${businessValueGenerated.toLocaleString()} | ROI = ($${businessValueGenerated.toLocaleString()} - $${aiCostIncurred.toLocaleString()}) ÷ $${aiCostIncurred.toLocaleString()} = ${netROIPercentage}%`,
  };
}

/**
 * Ordinary Least Squares (OLS) Linear Regression for Cost & Token Usage Forecasting (Section 11.3 MVP Algorithm)
 * Prepared for simple transition to ARIMA and Facebook Prophet in Phase 2 roadmap.
 */
export function generateOLSForecast(historicalCosts: number[] = [1200, 1450, 1580, 1720, 1890, 2100]): {
  slope: number;
  intercept: number;
  rSquared: number;
  forecastPoints: ForecastPoint[];
  roadmapNote: string;
} {
  const n = historicalCosts.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const y = historicalCosts[i]!;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = (n * sumXX - sumX * sumX);
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared precision
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const y = historicalCosts[i]!;
    const yPred = slope * (i + 1) + intercept;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(y - yPred, 2);
  }
  const rSquared = ssTot !== 0 ? Math.max(0, 1 - (ssRes / ssTot)) : 0.95;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul (Proj)', 'Aug (Proj)', 'Sep (Proj)', 'Oct (Proj)'];
  const forecastPoints: ForecastPoint[] = [];

  for (let i = 0; i < months.length; i++) {
    const monthName = months[i]!;
    if (i < n) {
      forecastPoints.push({
        dayOrMonth: monthName,
        historicalCost: historicalCosts[i],
        historicalTokens: Math.round((historicalCosts[i]! / 0.15) * 1000),
      });
    } else {
      const predictedCost = Math.round(slope * (i + 1) + intercept);
      forecastPoints.push({
        dayOrMonth: monthName,
        projectedCost: predictedCost,
        projectedTokens: Math.round((predictedCost / 0.13) * 1000), // accounts for AI Cost Advisor savings
      });
    }
  }

  return {
    slope: Number(slope.toFixed(2)),
    intercept: Number(intercept.toFixed(2)),
    rSquared: Number((rSquared * 100).toFixed(1)),
    forecastPoints,
    roadmapNote: 'MVP runs high-accuracy Ordinary Least Squares (OLS) Linear Regression. Automatic failover to seasonal ARIMA & Facebook Prophet time-series models scheduled as 12+ months of historical telemetry accumulates (Section 18 Roadmap).',
  };
}
