from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.security import SupabaseAuth

app = FastAPI(
    title="Clinical Forms API",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)

# Set up CORS
if settings.ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.ALLOWED_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add Supabase JWT authentication
auth = SupabaseAuth()

# Include API router
app.include_router(api_router, prefix=settings.API_PREFIX, dependencies=[auth])


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return JSONResponse(content={"status": "ok"})


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return JSONResponse(
        content={
            "message": "Welcome to the Clinical Forms API",
            "docs": "/docs",
            "redoc": "/redoc",
        }
    )