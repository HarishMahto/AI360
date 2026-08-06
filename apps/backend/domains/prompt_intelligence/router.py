"""
AI360 – Prompt Intelligence HTTP Router
Endpoints: POST /prompt/score, POST /prompt/optimize, POST /prompt/classify
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status

from core.rbac import get_current_user, CurrentUser
from core.exceptions import PromptRejectedError
from domains.prompt_intelligence.schemas import (
    PromptScoreRequest, PromptScoreResponse,
    PromptOptimizeRequest, PromptOptimizeResponse,
    PromptClassifyRequest, PromptClassifyResponse,
    PrivacyLayerRequest, PrivacyLayerResponse, PrivacyMetadata,
    PromptCoachRequest, PromptCoachResponse,
    ModelRecommendationSignal,
    PromptHistoryItem, PromptHistoryCreateRequest,
    PromptMarketplaceItem,
    LearningCoachResponse,
    SessionSummaryResponse,
)
from domains.prompt_intelligence.validator import PromptValidator
from domains.prompt_intelligence.classifier import PromptClassifier
from domains.prompt_intelligence.scorer import PromptQualityScorer
from domains.prompt_intelligence.pii_scanner import SensitiveDataScanner
from domains.prompt_intelligence.optimizer import PromptOptimizer
from domains.prompt_intelligence.employee_engine import EmployeeDashboardEngine
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prompt", tags=["Prompt Intelligence"])

# Module-level service instances (singletons)
_validator = PromptValidator()
_classifier = PromptClassifier()
_scorer = PromptQualityScorer()
_scanner = SensitiveDataScanner()
_optimizer = PromptOptimizer()
_employee_engine = EmployeeDashboardEngine()


@router.post("/score", response_model=PromptScoreResponse, summary="Score a prompt for quality")
async def score_prompt(
    request: PromptScoreRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Score a prompt across 6 quality criteria:
    Clarity, Context, Specificity, Structure, Constraints, Output Format.
    Also classifies the prompt category and scans for sensitive data.
    """
    try:
        cleaned = _validator.validate(request.prompt)
    except PromptRejectedError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    score = _scorer.score(cleaned)
    category, confidence = _classifier.classify(cleaned)
    findings = _scanner.scan(cleaned)

    return PromptScoreResponse(
        score=score,
        category=category,
        category_confidence=confidence,
        sensitive_findings=findings,
    )


@router.post("/optimize", response_model=PromptOptimizeResponse, summary="Optimize a prompt using AI")
async def optimize_prompt(
    request: PromptOptimizeRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Optimize a prompt using Gemini Flash.
    Returns the optimized version, 5 style rewrites, score improvement estimate,
    and any sensitive data warnings.
    """
    try:
        cleaned = _validator.validate(request.prompt)
    except PromptRejectedError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    result = await _optimizer.optimize(cleaned, request.category)
    return result


@router.post("/classify", response_model=PromptClassifyResponse, summary="Classify a prompt by category")
async def classify_prompt(
    request: PromptClassifyRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Classify a prompt into one of 10 predefined task categories.
    Returns the category and confidence score.
    """
    try:
        cleaned = _validator.validate(request.prompt)
    except PromptRejectedError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    category, confidence = _classifier.classify(cleaned)
    return PromptClassifyResponse(category=category, confidence=confidence)


@router.post("/privacy-layer", response_model=PrivacyLayerResponse, summary="Execute Section 11.5.4 AI Prompt Privacy Layer")
async def execute_privacy_layer(
    request: PrivacyLayerRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Section 11.5.4 AI Prompt Privacy Layer:
    Classifies prompt for API keys, passwords, secrets, customer names, and PII.
    1. Masks sensitive values before analytics transmission.
    2. Enforces metadata-only analytics storage unless full prompt storage is allowed.
    3. Warns the employee before submitting sensitive content to external models.
    """
    import datetime
    try:
        cleaned = _validator.validate(request.prompt)
    except PromptRejectedError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    findings = _scanner.scan(cleaned)
    masked_prompt = _scanner.mask_prompt(cleaned, findings)
    score = _scorer.score(cleaned)
    token_count = max(1, len(cleaned.split()) * 4 // 3)

    detected_types = sorted(list(set([f.type.value for f in findings])))
    warning_message = None
    if findings:
        warning_message = f"🛡️ AI360 Security Guardrail Triggered: Detected sensitive enterprise data ({', '.join(detected_types)}). Values have been automatically masked before routing to external AI provider."

    metadata = PrivacyMetadata(
        token_count=token_count,
        model=request.target_model or "gemini-1.5-flash",
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        prompt_quality_score=score.overall
    )

    stored_payload_type = "full_prompt" if request.allow_full_prompt_storage else "metadata_only"

    return PrivacyLayerResponse(
        contains_sensitive_data=len(findings) > 0,
        detected_types=detected_types,
        masked_prompt=masked_prompt,
        warning_message=warning_message,
        metadata=metadata,
        stored_payload_type=stored_payload_type,
        sensitive_findings=findings
    )


# ── Section 10.2 Employee Dashboard Endpoints ─────────────────────────────────

@router.post("/coach", response_model=PromptCoachResponse, summary="10.2.1 & 10.2.2 Prompt Coach and Token Optimizer")
async def evaluate_prompt_coach(
    request: PromptCoachRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Evaluates prompt before submission, calculates 5-dimension rubric score and token reductions."""
    return await _employee_engine.evaluate_prompt_coach(request)


@router.get("/model-recommendations", response_model=List[ModelRecommendationSignal], summary="10.2.3 AI Model Recommendation")
async def get_model_recommendations(
    current_model: Optional[str] = "GPT-5 (general use)",
    task_type: Optional[str] = "Summarization",
    current_user: CurrentUser = Depends(get_current_user),
):
    """Proposes cheaper or better model options based on task type and current model choice."""
    return _employee_engine.get_model_recommendations(current_model, task_type)


@router.get("/history", response_model=List[PromptHistoryItem], summary="10.2.4 Prompt History Search & Reuse")
async def get_prompt_history(
    query: Optional[str] = None,
    favorite_only: bool = False,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Searchable, reusable, favoritable, and shareable user prompt history from Firebase/cache."""
    return _employee_engine.get_prompt_history(current_user.user_id, query, favorite_only)


@router.post("/history", response_model=PromptHistoryItem, summary="Save Prompt to History")
async def save_prompt_history(
    request: PromptHistoryCreateRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Saves prompt to Firestore history collection."""
    return _employee_engine.save_prompt_history(current_user.user_id, request)


@router.put("/history/{prompt_id}/favorite", summary="Toggle Favorite Pin on Saved Prompt")
async def toggle_favorite_prompt(
    prompt_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Pins or unpins a prompt in history."""
    status = _employee_engine.toggle_favorite(prompt_id)
    return {"id": prompt_id, "is_favorite": status}


@router.get("/marketplace", response_model=List[PromptMarketplaceItem], summary="10.2.5 Prompt Marketplace")
async def get_prompt_marketplace(
    category: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Package registry style prompt templates sorted dynamically by developer usage and star ratings."""
    return _employee_engine.get_prompt_marketplace(category)


@router.post("/marketplace/{prompt_id}/publish", response_model=PromptMarketplaceItem, summary="Publish Prompt to Marketplace")
async def publish_prompt_to_marketplace(
    prompt_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Publishes a proven prompt from history into the organization Marketplace."""
    res = _employee_engine.publish_to_marketplace(prompt_id)
    if not res:
        raise HTTPException(status_code=404, detail="Prompt ID not found in history")
    return res


@router.get("/learning-coach", response_model=LearningCoachResponse, summary="10.2.6 AI Learning Coach")
async def get_learning_coach_tips(
    current_user: CurrentUser = Depends(get_current_user),
):
    """Surfaces targeted coaching tips based on actual observed prompting patterns and tracks score growth over time."""
    return _employee_engine.get_learning_coach(current_user.user_id)


@router.get("/session-summary", response_model=SessionSummaryResponse, summary="10.2.7 Session & Usage Summary")
async def get_session_summary(
    current_user: CurrentUser = Depends(get_current_user),
):
    """Returns live mid-day usage snapshot and full end-of-day summary with cost and hours saved estimates."""
    return _employee_engine.get_session_summary(current_user.user_id)

