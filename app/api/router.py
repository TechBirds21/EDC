from fastapi import APIRouter

from app.api.endpoints import change_log, form_templates, forms, volunteers

api_router = APIRouter()

api_router.include_router(
    volunteers.router, prefix="/volunteers", tags=["volunteers"]
)
api_router.include_router(
    form_templates.router, prefix="/form-templates", tags=["form-templates"]
)
api_router.include_router(
    forms.router, prefix="/forms", tags=["forms"]
)
api_router.include_router(
    change_log.router, prefix="/change-log", tags=["change-log"]
)