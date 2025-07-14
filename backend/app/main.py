from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.security import JWTAuth

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add JWT authentication
auth = JWTAuth()

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


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
            "message": "Welcome to the Clinical Capture API",
            "docs": "/docs",
            "redoc": "/redoc",
        }
    )