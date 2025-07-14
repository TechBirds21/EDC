from fastapi import APIRouter

from app.api.endpoints import auth, forms, projects, audit, pdf_export

api_router = APIRouter()

# Authentication endpoints
api_router.include_router(
    auth.router, prefix="/auth", tags=["authentication"]
)

# Core functionality endpoints  
api_router.include_router(
    forms.router, prefix="/forms", tags=["forms"]
)
api_router.include_router(
    projects.router, prefix="/projects", tags=["projects"]
)

# Audit and reporting endpoints
api_router.include_router(
    audit.router, prefix="/audit", tags=["audit"]
)

# PDF export endpoints
api_router.include_router(
    pdf_export.router, prefix="/export", tags=["export"]
)

# Legacy endpoints (if needed for backward compatibility)
# api_router.include_router(
#     change_log.router, prefix="/change-log", tags=["change-log"]
# )
# api_router.include_router(
#     form_templates.router, prefix="/form-templates", tags=["form-templates"]
# )
# api_router.include_router(
#     volunteers.router, prefix="/volunteers", tags=["volunteers"]
# )