import logging
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from core.rbac import get_current_user, CurrentUser
from domains.telemetry.schemas import UsageTelemetryRequest
from core.firebase import get_firestore

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("/usage", summary="Record token and prompt usage telemetry")
async def record_usage_telemetry(
    request: UsageTelemetryRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    try:
        db = get_firestore()
        # Ensure collection exists or create a new document in usage_telemetry
        telemetry_ref = db.collection("usage_telemetry").document()
        telemetry_data = {
            "user_id": current_user.user_id,
            "prompt_text": request.prompt_text,
            "prompt_score": request.prompt_score,
            "input_tokens": request.input_tokens,
            "output_tokens": request.output_tokens,
            "total_tokens": request.total_tokens,
            "model": request.model,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        telemetry_ref.set(telemetry_data)
        
        return {"success": True, "id": telemetry_ref.id}
    except Exception as e:
        logger.error(f"Error saving telemetry: {e}")
        raise HTTPException(status_code=500, detail="Failed to save telemetry")
