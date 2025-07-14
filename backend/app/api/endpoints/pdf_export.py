from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user, User as SecurityUser
from app.db.session import get_db
from app.schemas.unified_schemas import PDFExportRequest
from app.services.pdf_service import pdf_export_service

router = APIRouter()

@router.post("/{form_id}")
async def export_form_pdf(
    form_id: UUID,
    export_request: PDFExportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Export a form as PDF
    """
    # Verify form access (similar to get_form endpoint)
    from app.models.unified_models import Form, Project
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    result = await db.execute(
        select(Form)
        .options(
            selectinload(Form.creator),
            selectinload(Form.project).selectinload(Project.assigned_users)
        )
        .where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Check access permissions
    if current_user.role == "employee":
        has_access = form.created_by == current_user.id
        if form.project and not has_access:
            has_access = any(user.id == current_user.id for user in form.project.assigned_users)
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this form"
            )
    
    # Generate PDF
    try:
        pdf_bytes = await pdf_export_service.generate_form_pdf(
            db=db,
            form_id=form_id,
            include_audit_trail=export_request.include_audit_trail,
            watermark=export_request.watermark
        )
        
        # Log the export activity
        from app.services.audit_service import log_activity
        await log_activity(
            db=db,
            action="export_pdf",
            resource_type="form",
            resource_id=form_id,
            user_id=current_user.id,
            details={
                "include_audit_trail": export_request.include_audit_trail,
                "watermark": export_request.watermark is not None
            },
            form_id=form_id
        )
        await db.commit()
        
        # Return PDF response
        filename = f"form_{form.case_id or form_id}_{form.form_type}.pdf"
        
        # Note: For HTML content (since we're not using actual PDF generation yet)
        # Change content type to "application/pdf" when using real PDF generation
        return Response(
            content=pdf_bytes,
            media_type="text/html",  # Change to "application/pdf" for real PDFs
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "text/html"  # Change to "application/pdf" for real PDFs
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )

@router.get("/{form_id}/preview")
async def preview_form_pdf(
    form_id: UUID,
    include_audit_trail: bool = False,
    watermark: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: SecurityUser = Depends(get_current_user)
) -> Any:
    """
    Preview form PDF in browser (returns HTML)
    """
    # Same access control as export
    from app.models.unified_models import Form, Project
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    result = await db.execute(
        select(Form)
        .options(
            selectinload(Form.creator),
            selectinload(Form.project).selectinload(Project.assigned_users)
        )
        .where(Form.id == form_id)
    )
    form = result.scalar_one_or_none()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    # Check access permissions
    if current_user.role == "employee":
        has_access = form.created_by == current_user.id
        if form.project and not has_access:
            has_access = any(user.id == current_user.id for user in form.project.assigned_users)
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this form"
            )
    
    # Generate HTML preview
    try:
        pdf_bytes = await pdf_export_service.generate_form_pdf(
            db=db,
            form_id=form_id,
            include_audit_trail=include_audit_trail,
            watermark=watermark
        )
        
        # Return HTML response for preview
        return Response(
            content=pdf_bytes,
            media_type="text/html"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate preview: {str(e)}"
        )