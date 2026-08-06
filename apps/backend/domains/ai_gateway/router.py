"""
AI360 – AI Gateway HTTP Router
Endpoints: POST /chat (with SSE streaming), GET /chat/history, GET /health/providers
"""
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import AsyncIterator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from core.rbac import get_current_user, CurrentUser
from core.firebase import get_firestore, Collections
from domains.ai_gateway.models import ChatRequest, ChatResponse, AIModel, AgentChatRequest, AgentChatResponse
from domains.ai_gateway.router_service import get_ai_router, AIRouter

logger = logging.getLogger(__name__)
router = APIRouter(tags=["AI Chat"])


@router.post("/chat", response_model=ChatResponse, summary="Send a chat message to AI")
async def send_chat(
    request: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db=Depends(get_firestore),
    ai_router: AIRouter = Depends(get_ai_router),
):
    """
    Send a chat request to the configured AI provider.
    Supports streaming via SSE when stream=True.
    Records usage to Firestore telemetry collections.
    """
    if request.stream:
        # SSE streaming response
        async def event_generator() -> AsyncIterator[dict]:
            full_content = ""
            try:
                async for chunk in ai_router.stream_chat(
                    messages=request.messages,
                    model=request.model,
                    max_tokens=request.max_tokens,
                    temperature=request.temperature or 0.7,
                ):
                    full_content += chunk
                    yield {"data": json.dumps({"chunk": chunk})}
                yield {"data": "[DONE]"}
            except Exception as e:
                yield {"data": json.dumps({"error": str(e)})}

        return EventSourceResponse(event_generator())

    # Non-streaming response
    response = await ai_router.chat(
        messages=request.messages,
        model=request.model,
        max_tokens=request.max_tokens,
        temperature=request.temperature or 0.7,
    )

    # Persist to Firestore telemetry (async, non-blocking)
    try:
        record_id = str(uuid.uuid4())
        last_prompt = request.messages[-1].content if request.messages else ""
        usage_doc = {
            "id": record_id,
            "userId": current_user.user_id,
            "organizationId": current_user.organization_id,
            "departmentId": current_user.department_id,
            "teamId": current_user.team_id,
            "projectId": request.project_id,
            "prompt": last_prompt,
            "response": response.content,
            "category": response.prompt_category or "OTHER",
            "promptScore": response.prompt_score or 0,
            "model": response.model,
            "provider": response.provider,
            "inputTokens": response.input_tokens,
            "outputTokens": response.output_tokens,
            "totalTokens": response.total_tokens,
            "estimatedCostUSD": response.estimated_cost_usd,
            "latencyMs": response.latency_ms,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        db.collection(Collections.PROMPT_HISTORY).document(record_id).set(usage_doc)
        db.collection(Collections.USAGE).document(record_id).set({
            k: v for k, v in usage_doc.items() if k not in ("prompt", "response")
        })
    except Exception as e:
        logger.warning(f"Failed to persist usage telemetry: {e}")

    return response


@router.post("/chat/agent", summary="Send an agentic chat request from VS Code Copilot")
async def send_agent_chat(
    request: AgentChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db=Depends(get_firestore),
    ai_router: AIRouter = Depends(get_ai_router),
):
    """
    Handles conversational workspace coding requests from the VS Code extension.
    Incorporates active file context and logs FinOps token usage in Firebase Firestore.
    """
    target_model = AIModel.GEMINI_15_FLASH
    if request.model and "claude" in request.model.lower():
        target_model = AIModel.CLAUDE_35_SONNET
    elif request.model and "gpt" in request.model.lower():
        target_model = AIModel.GPT_4O_MINI

    messages = list(request.messages)
    if request.context and (request.context.activeFile or request.context.selectedText):
        ctx_text = f"Workspace Active File: {request.context.activeFile or 'unknown'}\n"
        if request.context.selectedText:
            ctx_text += f"Selected Code: {request.context.selectedText[:1000]}\n"
        # Prepend workspace context to the initial prompt if feasible, or let AI model handle it
        if messages and messages[-1].content:
            messages[-1].content = f"[{ctx_text}]\n\n{messages[-1].content}"

    response = await ai_router.chat(
        messages=messages,
        model=target_model,
        max_tokens=request.max_tokens or 2048,
        temperature=request.temperature or 0.7,
    )

    try:
        record_id = str(uuid.uuid4())
        last_prompt = request.messages[-1].content if request.messages else ""
        usage_doc = {
            "id": record_id,
            "userId": current_user.user_id,
            "organizationId": current_user.organization_id,
            "departmentId": current_user.department_id,
            "teamId": current_user.team_id,
            "projectId": request.project_id or "VS_CODE_COPILOT",
            "prompt": last_prompt,
            "response": response.content,
            "category": "CODING",
            "promptScore": 88,
            "model": response.model,
            "provider": response.provider,
            "inputTokens": response.input_tokens,
            "outputTokens": response.output_tokens,
            "totalTokens": response.total_tokens,
            "estimatedCostUSD": response.estimated_cost_usd,
            "latencyMs": response.latency_ms,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        db.collection(Collections.PROMPT_HISTORY).document(record_id).set(usage_doc)
        db.collection(Collections.USAGE).document(record_id).set({
            k: v for k, v in usage_doc.items() if k not in ("prompt", "response")
        })
    except Exception as e:
        logger.warning(f"Failed to persist VS Code copilot telemetry: {e}")

    agent_resp = AgentChatResponse(
        id=response.id,
        content=response.content,
        model=response.model,
        provider=response.provider,
        estimatedCostUSD=response.estimated_cost_usd,
        totalTokens=response.total_tokens,
        latency_ms=response.latency_ms,
        prompt_score=88.0,
    )
    return {"data": agent_resp}


@router.get("/chat/history", summary="Get paginated chat history for the current user")
async def get_chat_history(
    page: int = 1,
    page_size: int = 20,
    category: str | None = None,
    current_user: CurrentUser = Depends(get_current_user),
    db=Depends(get_firestore),
):
    """
    Returns paginated prompt history for the authenticated user.
    """
    query = (
        db.collection(Collections.PROMPT_HISTORY)
        .where("userId", "==", current_user.user_id)
        .order_by("timestamp", direction="DESCENDING")
    )
    if category:
        query = query.where("category", "==", category.upper())

    # Simple offset pagination
    offset = (page - 1) * page_size
    docs = list(query.limit(page_size + offset).stream())
    docs = docs[offset:]

    return {
        "data": [doc.to_dict() for doc in docs],
        "page": page,
        "page_size": page_size,
        "has_more": len(docs) == page_size,
    }


@router.get("/health/providers", summary="Check AI provider availability")
async def provider_health(
    current_user: CurrentUser = Depends(get_current_user),
    ai_router: AIRouter = Depends(get_ai_router),
):
    """Returns which AI providers are currently configured and available."""
    return {"providers": ai_router.health_check()}
