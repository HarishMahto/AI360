"""
AI360 – AI Gateway Domain Models
Shared request/response Pydantic models used across all provider adapters.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class AIModel(str, Enum):
    # OpenAI
    GPT_4O = "gpt-4o"
    GPT_4O_MINI = "gpt-4o-mini"
    GPT_4_TURBO = "gpt-4-turbo"
    GPT_35_TURBO = "gpt-3.5-turbo"
    # Google Gemini
    GEMINI_15_PRO = "gemini-1.5-pro"
    GEMINI_15_FLASH = "gemini-1.5-flash"
    GEMINI_20_FLASH = "gemini-2.0-flash"
    # Anthropic Claude
    CLAUDE_35_SONNET = "claude-3-5-sonnet-20241022"
    CLAUDE_3_HAIKU = "claude-3-haiku-20240307"
    CLAUDE_3_OPUS = "claude-3-opus-20240229"


class AIProvider(str, Enum):
    OPENAI = "OPENAI"
    GEMINI = "GEMINI"
    CLAUDE = "CLAUDE"


# Map each model to its provider
MODEL_PROVIDER_MAP: dict[AIModel, AIProvider] = {
    AIModel.GPT_4O: AIProvider.OPENAI,
    AIModel.GPT_4O_MINI: AIProvider.OPENAI,
    AIModel.GPT_4_TURBO: AIProvider.OPENAI,
    AIModel.GPT_35_TURBO: AIProvider.OPENAI,
    AIModel.GEMINI_15_PRO: AIProvider.GEMINI,
    AIModel.GEMINI_15_FLASH: AIProvider.GEMINI,
    AIModel.GEMINI_20_FLASH: AIProvider.GEMINI,
    AIModel.CLAUDE_35_SONNET: AIProvider.CLAUDE,
    AIModel.CLAUDE_3_HAIKU: AIProvider.CLAUDE,
    AIModel.CLAUDE_3_OPUS: AIProvider.CLAUDE,
}

# Cost per 1M tokens (input, output) in USD
MODEL_COST_TABLE: dict[str, dict[str, float]] = {
    "gpt-4o": {"input": 5.00, "output": 15.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "gemini-1.5-pro": {"input": 3.50, "output": 10.50},
    "gemini-1.5-flash": {"input": 0.075, "output": 0.30},
    "gemini-2.0-flash": {"input": 0.10, "output": 0.40},
    "claude-3-5-sonnet-20241022": {"input": 3.00, "output": 15.00},
    "claude-3-haiku-20240307": {"input": 0.25, "output": 1.25},
    "claude-3-opus-20240229": {"input": 15.00, "output": 75.00},
}


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1)
    model: AIModel = AIModel.GPT_4O_MINI
    stream: bool = False
    project_id: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)


class ChatResponse(BaseModel):
    id: str
    content: str
    model: str
    provider: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    estimated_cost_usd: float
    latency_ms: Optional[int] = 0
    prompt_score: Optional[float] = None
    prompt_category: Optional[str] = None


class WorkspaceContext(BaseModel):
    activeFile: Optional[str] = None
    fileContent: Optional[str] = None
    selectedText: Optional[str] = None


class AgentChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1)
    model: str = "gemini-1.5-flash"
    context: Optional[WorkspaceContext] = None
    project_id: Optional[str] = None
    max_tokens: Optional[int] = None
    temperature: Optional[float] = 0.7


class AgentChatResponse(BaseModel):
    id: str
    content: str
    model: str
    provider: str
    estimatedCostUSD: float
    totalTokens: int
    latency_ms: int
    prompt_score: Optional[float] = None
