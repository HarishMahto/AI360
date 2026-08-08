from pydantic import BaseModel
from typing import Optional

class UsageTelemetryRequest(BaseModel):
    prompt_text: str
    prompt_score: int
    input_tokens: int
    output_tokens: int
    total_tokens: int
    model: str
