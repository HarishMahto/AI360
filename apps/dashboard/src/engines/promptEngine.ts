// AI360 Prompt Intelligence Engine (Sections 11.1 & 11.5.4)
// Implements Prompt Classification, 5-Dimension Quality Scoring, Prompt Optimization,
// Rewrite Suggestions, and the enterprise-grade AI Prompt Privacy Layer.

export interface QualityDimensions {
  clarity: number;      // 0-20
  context: number;      // 0-20
  specificity: number;  // 0-20
  format: number;       // 0-20
  examples: number;     // 0-20
}

export interface PromptAnalysisResult {
  originalPrompt: string;
  classification: 'Summarization' | 'Code Generation' | 'Complex Reasoning' | 'Data Analysis' | 'General Content';
  qualityScore: number; // 0 - 100
  dimensions: QualityDimensions;
  optimizedPrompt: string;
  coachingFeedback: string[];
  privacyAnalysis: {
    containsSensitiveData: boolean;
    detectedTypes: string[]; // e.g. ["API Keys", "SAP Passwords", "Customer Names", "PII"]
    maskedPrompt: string;
    warningMessage: string | null;
  };
  metadataOnly: {
    tokenCount: number;
    recommendedModel: string;
    timestamp: string;
    quality: number;
  };
}

/**
 * Enterprise AI Prompt Privacy Layer (Section 11.5.4)
 * Detects sensitive enterprise data before transmission to external AI providers.
 */
export function runPrivacyLayer(promptText: string) {
  const detectedTypes: string[] = [];
  let maskedText = promptText;

  // 1. Detect API Keys & Secrets
  if (/(ak_|sk-|api_key|gapi_|bearer\s+[A-Za-z0-9\-\._~+\/]+=*)/i.test(maskedText)) {
    detectedTypes.push('API Keys & Tokens');
    maskedText = maskedText.replace(/(ak_[a-zA-Z0-9]+|sk-[a-zA-Z0-9]+|bearer\s+[A-Za-z0-9\-\._~+\/]+=*)/gi, '[MASKED_API_KEY]');
  }

  // 2. Detect Passwords & SAP Credentials (Section 11.5.4 Example)
  if (/(password\s+is\s+[\w@#$%^&*!]+|pwd\s*=\s*[\w@#$%^&*!]+|secret\s*=\s*[\w@#$%^&*!]+|sap\s+password)/i.test(maskedText)) {
    detectedTypes.push('Passwords & SAP Credentials');
    maskedText = maskedText.replace(/(password\s+is\s+)(\S+)/gi, '$1[MASKED_PASSWORD]');
    maskedText = maskedText.replace(/(pwd\s*=\s*)(\S+)/gi, '$1[MASKED_PASSWORD]');
  }

  // 3. Detect Enterprise Customer Names / Specific References
  if (/(Customer\s+[A-Z]{2,5}|Client\s+[A-Z]{2,5}|Account\s+#?\d{5,})/i.test(maskedText)) {
    detectedTypes.push('Customer Identifiers & Accounts');
    maskedText = maskedText.replace(/(Customer\s+[A-Z]{2,5}|Client\s+[A-Z]{2,5}|Account\s+#?\d{5,})/gi, '[MASKED_CUSTOMER_ID]');
  }

  // 4. Detect PII (Emails, Phone numbers, Credit Cards, SSN)
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(maskedText) || /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(maskedText)) {
    detectedTypes.push('Personal Identifiable Information (PII)');
    maskedText = maskedText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[MASKED_EMAIL]');
    maskedText = maskedText.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[MASKED_PHONE]');
  }

  const containsSensitiveData = detectedTypes.length > 0;
  const warningMessage = containsSensitiveData
    ? `⚠️ SECURITY WARNING: Your prompt contains sensitive enterprise data (${detectedTypes.join(', ')}). Values have been automatically masked to protect organizational privacy.`
    : null;

  return {
    containsSensitiveData,
    detectedTypes,
    maskedPrompt: maskedText,
    warningMessage,
  };
}

/**
 * Promt Classification Engine
 * Classifies tasks to route to appropriate LLM capabilities.
 */
export function classifyPrompt(promptText: string): PromptAnalysisResult['classification'] {
  const lower = promptText.toLowerCase();
  if (lower.includes('code') || lower.includes('function') || lower.includes('api') || lower.includes('java') || lower.includes('python') || lower.includes('react') || lower.includes('sql')) {
    return 'Code Generation';
  }
  if (lower.includes('summarize') || lower.includes('tl;dr') || lower.includes('summary') || lower.includes('condense') || lower.includes('brief') || lower.includes('abstract')) {
    return 'Summarization';
  }
  if (lower.includes('why') || lower.includes('analyze') || lower.includes('compare') || lower.includes('reason') || lower.includes('evaluate') || lower.includes('strategy') || lower.includes('architecture')) {
    return 'Complex Reasoning';
  }
  if (lower.includes('data') || lower.includes('table') || lower.includes('metrics') || lower.includes('csv') || lower.includes('chart')) {
    return 'Data Analysis';
  }
  return 'General Content';
}

/**
 * 5-Dimension Prompt Quality Scorer
 * Simulates Gemini API rubric breakdown across Clarity, Context, Specificity, Format, and Use of Examples.
 */
export function scorePromptQuality(promptText: string): { total: number; dimensions: QualityDimensions; feedback: string[]; optimized: string } {
  const length = promptText.trim().length;
  const wordCount = promptText.trim().split(/\s+/).length;

  let clarity = Math.min(20, Math.max(8, Math.round((length / 50) * 12)));
  let context = Math.min(20, Math.max(6, Math.round((wordCount / 15) * 10)));
  let specificity = Math.min(20, Math.max(5, Math.round(10 + (promptText.includes('must') || promptText.includes('only') || promptText.includes('specifically') ? 8 : 0))));
  let format = Math.min(20, Math.max(4, Math.round(8 + (promptText.toLowerCase().includes('json') || promptText.toLowerCase().includes('bullet') || promptText.toLowerCase().includes('markdown') ? 10 : 0))));
  let examples = Math.min(20, Math.max(3, Math.round(5 + (promptText.toLowerCase().includes('example') || promptText.toLowerCase().includes('e.g.') || promptText.toLowerCase().includes('like this:') ? 12 : 0))));

  // If prompt is well-detailed (> 20 words), elevate baseline
  if (wordCount > 15) {
    clarity = Math.max(clarity, 16);
    context = Math.max(context, 15);
  }
  if (wordCount > 30) {
    specificity = Math.max(specificity, 17);
    format = Math.max(format, 16);
  }

  const total = Math.min(100, clarity + context + specificity + format + examples);
  const feedback: string[] = [];

  if (clarity < 15) feedback.push('Clarify your exact end goal; state explicitly what role or persona the AI should assume.');
  if (context < 14) feedback.push('Provide background context regarding why this problem needs solving and intended domain audience.');
  if (specificity < 15) feedback.push('Add explicit edge case constraints and boundaries (e.g., maximum length or tone restrictions).');
  if (format < 14) feedback.push('Specify the precise output structure required (e.g., Markdown table, JSON schema, or numbered bullet list).');
  if (examples < 14) feedback.push('Include at least one concrete example or reference input-output pair to guide inference accuracy.');

  if (feedback.length === 0) {
    feedback.push('✨ Exceptional enterprise prompt structure! All 5 rubric dimensions are strongly satisfied.');
  }

  // Generate Optimized Prompt Rewrite
  const taskType = classifyPrompt(promptText);
  let optimized = promptText;
  if (taskType === 'Code Generation') {
    optimized = `[Role: Senior Software Architect]\n[Context]: ${promptText}\n[Requirements]: Write production-grade code with zero placeholders. Ensure proper exception handling and TypeScript/Java type safety.\n[Output Format]: Fenced markdown code block followed by a brief bulleted explanation of complex design trade-offs.`;
  } else if (taskType === 'Summarization') {
    optimized = `[Task]: Summarize the following document accurately with zero hallucination.\n[Source Text]: "${promptText}"\n[Output Constraints]: Provide 1 executive headline, a 3-bullet core findings summary, and action items in structured table format.`;
  } else {
    optimized = `[Objective]: Perform an in-depth analytical assessment of the following query.\n[Query]: "${promptText}"\n[Evaluation Framework]: Analyze across technical rigor, cost effectiveness, and implementation speed.\n[Output Format]: Present recommendations in a prioritized markdown table with explicit rationale for each item.`;
  }

  return { total, dimensions: { clarity, context, specificity, format, examples }, feedback, optimized };
}

/**
 * Core Orchestration: Analyzes prompt and executes all Section 11.1 and 11.5.4 checks
 */
export function analyzePrompt(promptText: string): PromptAnalysisResult {
  const privacy = runPrivacyLayer(promptText);
  // We score the masked prompt to ensure privacy
  const scoring = scorePromptQuality(privacy.maskedPrompt);
  const classification = classifyPrompt(privacy.maskedPrompt);

  let recommendedModel = 'Gemini Flash';
  if (classification === 'Code Generation') recommendedModel = 'Claude 3.5 Sonnet';
  if (classification === 'Complex Reasoning') recommendedModel = 'GPT-5';

  const tokenCount = Math.round(promptText.length / 4.2);

  return {
    originalPrompt: promptText,
    classification,
    qualityScore: scoring.total,
    dimensions: scoring.dimensions,
    optimizedPrompt: scoring.optimized,
    coachingFeedback: scoring.feedback,
    privacyAnalysis: privacy,
    metadataOnly: {
      tokenCount,
      recommendedModel,
      timestamp: new Date().toISOString(),
      quality: scoring.total,
    },
  };
}
