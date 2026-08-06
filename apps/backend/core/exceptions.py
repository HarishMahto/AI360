"""
AI360 Backend – Custom Exception Handlers
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from firebase_admin.exceptions import FirebaseError
import logging

logger = logging.getLogger(__name__)


class AI360Exception(Exception):
    """Base exception for AI360 business logic errors."""
    def __init__(self, message: str, code: str = "AI360_ERROR", status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class ProviderUnavailableError(AI360Exception):
    def __init__(self, provider: str):
        super().__init__(f"AI provider '{provider}' is currently unavailable.", "PROVIDER_UNAVAILABLE", 503)


class BudgetExceededError(AI360Exception):
    def __init__(self, limit: float, current: float):
        super().__init__(f"Budget limit ${limit:.2f} exceeded (current: ${current:.2f}).", "BUDGET_EXCEEDED", 402)


class PromptRejectedError(AI360Exception):
    def __init__(self, reason: str):
        super().__init__(f"Prompt rejected: {reason}", "PROMPT_REJECTED", 422)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""

    @app.exception_handler(AI360Exception)
    async def ai360_exception_handler(request: Request, exc: AI360Exception):
        logger.error(f"AI360Exception: {exc.message}")
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message, "code": exc.code})

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = [{"field": ".".join(str(l) for l in err["loc"]), "message": err["msg"]} for err in exc.errors()]
        return JSONResponse(status_code=422, content={"detail": "Validation error", "errors": errors})

    @app.exception_handler(FirebaseError)
    async def firebase_exception_handler(request: Request, exc: FirebaseError):
        logger.error(f"Firebase error: {exc}")
        return JSONResponse(status_code=503, content={"detail": "Firebase service error", "code": "FIREBASE_ERROR"})

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled exception: {exc}")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
