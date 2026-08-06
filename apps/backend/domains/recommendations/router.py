"""
AI360 – Recommendations HTTP Router
Endpoints: GET /recommendations
"""
import logging
from typing import List
from fastapi import APIRouter, Depends

from core.rbac import get_current_user, CurrentUser
from core.firebase import get_firestore
from domains.recommendations.schemas import (
    RecommendationResponse, ModelRoutingRequest, ModelRoutingResponse, SmartSuggestionsResponse
)
from domains.recommendations.service import RecommendationEngine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
@router.get("/employee", response_model=List[RecommendationResponse])
async def get_recommendations(
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Returns active recommendations for the requesting user or employee session.
    """
    engine = RecommendationEngine(db)
    user_id = current_user.user_id if hasattr(current_user, "user_id") else current_user.get("uid", "test_user_123")
    return engine.get_recommendations(user_id)


@router.post("/model-routing", response_model=ModelRoutingResponse)
async def evaluate_model_routing(
    request: ModelRoutingRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Section 11.2: Returns optimal multi-model routing recommendation based on prompt/task analysis.
    """
    engine = RecommendationEngine(db)
    return engine.evaluate_model_routing(request.task_or_prompt)

@router.get("/smart-suggestions", response_model=SmartSuggestionsResponse)
async def get_smart_suggestions(
    department: str = "Engineering",
    current_user: CurrentUser = Depends(get_current_user),
    db = Depends(get_firestore)
):
    """
    Section 11.2: Returns automated coaching across prompt improvements, FinOps savings, and department impact.
    """
    engine = RecommendationEngine(db)
    return engine.get_smart_suggestions(department)

