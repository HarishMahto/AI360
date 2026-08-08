"""
AI360 Backend – FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from core.firebase import initialize_firebase, get_firestore
from core.exceptions import register_exception_handlers

# Domain routers
from domains.auth.router import router as auth_router
from domains.users.router import router as users_router
from domains.organizations.router import router as organizations_router
from domains.ai_gateway.router import router as chat_router
from domains.prompt_intelligence.router import router as prompt_router
from domains.analytics.router import router as analytics_router
from domains.recommendations.router import router as recommendations_router
from domains.finops.router import router as finops_router
from domains.forecast.router import router as forecast_router
from domains.reports.router import router as reports_router
from domains.notifications.router import router as notifications_router
from domains.telemetry.router import router as telemetry_router
from domains.analytics.service import AnalyticsService

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info("AI360 backend starting up...")
    try:
        initialize_firebase()
        logger.info("Firebase initialized.")
    except Exception as e:
        logger.warning(f"Firebase initialization warning (non-fatal): {e}")
        
    scheduler = None
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler()
        
        def run_aggregation_job():
            try:
                db = get_firestore()
                if db:
                    service = AnalyticsService(db)
                    service.run_daily_aggregation()
            except Exception as e:
                logger.error(f"Failed to run daily aggregation job: {e}")
                
        scheduler.add_job(run_aggregation_job, 'cron', hour=0, minute=0)
        scheduler.start()
        logger.info("APScheduler started.")
    except Exception as e:
        logger.warning(f"APScheduler startup skipped in serverless environment: {e}")

    yield
    
    if scheduler:
        try:
            scheduler.shutdown()
        except Exception:
            pass
    logger.info("AI360 backend shutting down.")


# ─── App Initialization ───────────────────────────────────────────────────────
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI360 – Enterprise AI Productivity, Governance & FinOps Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_favicon_url="https://ai360-c1b0b.web.app/logo.png",
    lifespan=lifespan,
)

# ─── Middleware ───────────────────────────────────────────────────────────────
allowed_origins = list(set(settings.cors_origins + [
    "https://ai360-c1b0b.web.app",
    "https://ai360-c1b0b.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.web\.app|https://.*\.firebaseapp\.com|https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Exception Handlers ───────────────────────────────────────────────────────
register_exception_handlers(app)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(organizations_router)
app.include_router(chat_router)
app.include_router(prompt_router)
app.include_router(analytics_router)
app.include_router(recommendations_router)
app.include_router(finops_router)
app.include_router(forecast_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(telemetry_router)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)
