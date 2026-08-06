"""
AI360 – Recommendations Service
Generates actionable recommendations for users, departments, and organizations based on usage analytics.
"""
import logging
from typing import List
from datetime import datetime, timezone, timedelta
import uuid

from core.firebase import get_firestore, Collections
from domains.recommendations.schemas import (
    RecommendationResponse, RecommendationType, Priority,
    ModelRoutingResponse, SmartSuggestionsResponse,
    LearningRecommendation, DepartmentRecommendation
)

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self, db):
        self.db = db

    def evaluate_model_routing(self, task_or_prompt: str) -> ModelRoutingResponse:
        """
        Section 11.2: Evaluates task signals and maps to optimal model per enterprise routing rules.
        """
        text = task_or_prompt.lower()
        if any(w in text for w in ['code', 'function', 'bug', 'refactor', 'java', 'react', 'python', 'typescript']):
            return ModelRoutingResponse(
                task_type="Code Generation",
                recommended_model="Claude 3.5 Sonnet",
                reasoning="Claude excels at structured syntax generation, deep semantic refactoring, and multi-file code consistency with superior reasoning over code structures.",
                estimated_cost_per_1k_tokens=0.24,
                latency_ms=850,
                cost_savings_percent=42
            )
        elif any(w in text for w in ['why', 'analyze', 'compare', 'strategy', 'architecture', 'reasoning', 'complex']):
            return ModelRoutingResponse(
                task_type="Complex Reasoning",
                recommended_model="GPT-5",
                reasoning="GPT-5 provides unmatched deep multi-step deduction, comprehensive synthesis of ambiguous edge cases, and high-fidelity enterprise decision modeling.",
                estimated_cost_per_1k_tokens=0.60,
                latency_ms=1200,
                cost_savings_percent=25
            )
        else:
            return ModelRoutingResponse(
                task_type="Summarization",
                recommended_model="Gemini 1.5 Flash",
                reasoning="Gemini Flash provides industry-leading ultra-fast latency and disruptive cost-efficiency for summarization, document QA, and standard workflow tasks.",
                estimated_cost_per_1k_tokens=0.05,
                latency_ms=280,
                cost_savings_percent=78
            )

    def get_smart_suggestions(self, department: str = "Engineering") -> SmartSuggestionsResponse:
        """
        Section 11.2: Returns automated coaching across prompt improvements, FinOps savings, and team strategies.
        """
        return SmartSuggestionsResponse(
            prompt_improvements=[
                'Use structured role framing ("Act as an experienced Enterprise Systems Architect...") to increase initial accuracy by ~35%.',
                'Replace vague adjectives ("fast", "good") with exact SLA targets and quantitative acceptance criteria.',
                'Employ Few-Shot Prompting by including 2 reference examples of desired input vs formatted output.',
            ],
            cost_reduction_tips=[
                'Route routine daily Jira ticket summarization to Gemini Flash instead of legacy heavy models to reduce API consumption costs by 78%.',
                'Implement prompt token caching for repeating context headers (e.g. standard product specs and compliance rules).',
                'Use AI360 Token Optimizer to prune redundant whitespace and verbose background sentences prior to API transmission.',
            ],
            learning_recommendations=[
                LearningRecommendation(course='Advanced Zero-Shot Chain-of-Thought Reasoning', skill_target='Complex Problem Solving', duration='45 mins'),
                LearningRecommendation(course='Enterprise Prompt Privacy & Guardrail Mastery', skill_target='Data Security & Compliance', duration='30 mins'),
                LearningRecommendation(course='Multi-Model Routing & Token FinOps Best Practices', skill_target='Cost Optimization', duration='60 mins'),
            ],
            department_recommendations=[
                DepartmentRecommendation(
                    target_team='Engineering',
                    advice='Shift 85% of automated git pull request review bots to Claude 3.5 Sonnet or Gemini Flash to improve syntax critique quality while lowering spend.',
                    projected_impact='+$1,450 / mo saved & +14% faster PR turnaround'
                ),
                DepartmentRecommendation(
                    target_team='Customer Support & Operations',
                    advice='Migrate ticket triage and email summarization pipelines exclusively to Gemini Flash.',
                    projected_impact='+$2,800 / mo saved with sub-300ms response SLAs'
                ),
                DepartmentRecommendation(
                    target_team='QA & Test Engineering',
                    advice='Adopt standardized Playwright/Jest testing prompt templates from the AI360 Prompt Marketplace to elevate team quality score from 67 to 85+.',
                    projected_impact='+32% faster automated test suite generation'
                ),
            ]
        )

    def generate_employee_recommendations(self, user_id: str) -> List[RecommendationResponse]:
        """
        Generates employee recommendations based on actual prompt history or intelligent enterprise defaults.
        """
        now = datetime.now(timezone.utc)
        now_str = now.isoformat()
        seven_days_ago = (now - timedelta(days=7)).isoformat()
        
        recs = []
        try:
            query = self.db.collection(Collections.PROMPT_HISTORY).where("userId", "==", user_id).where("timestamp", ">=", seven_days_ago)
            records = [doc.to_dict() for doc in query.stream()]
        except Exception:
            records = []
        
        if records:
            avg_score = sum(r.get("promptScore", 0) for r in records) / len(records)
            if avg_score < 60:
                recs.append(RecommendationResponse(
                    id=str(uuid.uuid4()),
                    type=RecommendationType.BETTER_PROMPT,
                    priority=Priority.MEDIUM,
                    target_id=user_id,
                    target_type="employee",
                    title="Improve Prompt Specificity",
                    description=f"Your average prompt score this week is {avg_score:.0f}/100. Adding expected output formats increases AI accuracy by 40%.",
                    action_label="View Examples",
                    created_at=now_str
                ))
                
            expensive_simple_tasks = [r for r in records if r.get("category") in ["SUMMARIZATION", "TRANSLATION"] and r.get("model") in ["gpt-4o", "claude-3-opus-20240229"]]
            if len(expensive_simple_tasks) > 5:
                estimated_savings = round(len(expensive_simple_tasks) * 0.01 * 30, 2)
                recs.append(RecommendationResponse(
                    id=str(uuid.uuid4()),
                    type=RecommendationType.BETTER_MODEL,
                    priority=Priority.LOW,
                    target_id=user_id,
                    target_type="employee",
                    title="Use a lighter model for basic tasks",
                    description=f"You used heavy models for {len(expensive_simple_tasks)} basic tasks. Switching to Gemini Flash or GPT-4o-mini will save an estimated ${estimated_savings:.2f}/month with similar quality.",
                    estimated_savings_usd=estimated_savings,
                    action_label="Apply Policy",
                    created_at=now_str
                ))

                
        if not recs:
            # Provide actionable Section 11.2 enterprise default suggestions if no warnings or history present
            recs = [
                RecommendationResponse(
                    id="rec-gemini-flash",
                    type=RecommendationType.BETTER_MODEL,
                    priority=Priority.HIGH,
                    target_id=user_id,
                    target_type="employee",
                    title="Switch routine unit test & summarization to Gemini 1.5 Flash",
                    description="Switching standard document QA and test generation tasks to Gemini 1.5 Flash preserves accuracy while cutting token costs by up to 78%.",
                    estimated_savings_usd=14.50,
                    action_label="Apply Model Switch",
                    created_at=now_str
                ),
                RecommendationResponse(
                    id="rec-prompt-caching",
                    type=RecommendationType.ESTIMATED_SAVINGS,
                    priority=Priority.MEDIUM,
                    target_id=user_id,
                    target_type="employee",
                    title="Enable Workspace Prompt Caching",
                    description="You frequently include repetitive system headers and imports. Enabling Prompt Caching reduces token redundancy by 78% and delivers 4.2x faster responses.",
                    estimated_savings_usd=8.20,
                    action_label="Enable Caching",
                    created_at=now_str
                ),
                RecommendationResponse(
                    id="rec-structured-constraints",
                    type=RecommendationType.BETTER_PROMPT,
                    priority=Priority.MEDIUM,
                    target_id=user_id,
                    target_type="employee",
                    title="Adopt Structured System Constraints in Prompt Studio",
                    description="Using explicit output formatting directives cuts down conversational clarification turns by half, conserving token budget and raising quality score by +34%.",
                    action_label="Open Prompt Studio",
                    created_at=now_str
                )
            ]
            
        return recs

    def generate_department_recommendations(self, department_id: str) -> List[RecommendationResponse]:
        """Generate department-level recommendations."""
        return []

    def get_recommendations(self, user_id: str) -> List[RecommendationResponse]:
        return self.generate_employee_recommendations(user_id)

