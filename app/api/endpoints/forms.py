from typing import Annotated, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.api.dependencies import get_current_user_id, get_pagination_params
from app.core.security import User, get_current_user
from app.db.session import get_db
from app.schemas.form import (
    FormCreate,
    FormPagination,
    FormPatch, 
    TableRowCreate,
    TableCellUpdate,
    FormResponse,
    FormUpdate,
)
from app.services import form as form_service
from app.services import volunteer as volunteer_service

router = APIRouter()


# New schemas for bulk submission
class FormSubmissionData(BaseModel):
    case_id: str
    volunteer_id: str
    study_number: str
    forms_data: Dict[str, Any]
    metadata: Dict[str, Any]


class BulkSubmissionResponse(BaseModel):
    success: bool
    case_id: str
    submission_id: Optional[str] = None
    message: str
    errors: Optional[Dict[str, list]] = None


class PartialFormSubmission(BaseModel):
    case_id: str
    form_name: str
    form_data: Dict[str, Any]
    submitted_at: str


class FormSyncData(BaseModel):
    template_id: str
    patient_id: str
    volunteer_id: Optional[str] = None
    study_number: Optional[str] = None
    answers: Dict[str, Any]
    created_at: str
    last_modified: str


@router.post("/bulk-submit", response_model=BulkSubmissionResponse)
async def bulk_submit_forms(
    submission_data: FormSubmissionData,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Submit all form data for a case in bulk.
    """
    try:
        # Verify volunteer exists
        volunteer = await volunteer_service.get_volunteer_by_id(
            db=db, volunteer_id=submission_data.volunteer_id
        )
        if not volunteer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Volunteer not found"
            )

        # Create forms for each form in the submission
        created_forms = []
        for form_name, form_data in submission_data.forms_data.items():
            # Create form entry
            form_create = FormCreate(
                template_id=form_name,  # Using form name as template_id for now
                volunteer_id=UUID(submission_data.volunteer_id),
                data=form_data,
                status="submitted"
            )
            
            form = await form_service.create_form(
                db=db, obj_in=form_create, created_by=UUID(current_user_id)
            )
            created_forms.append(form)

        # Log the bulk submission
        submission_id = f"bulk_{submission_data.case_id}_{len(created_forms)}"
        
        return BulkSubmissionResponse(
            success=True,
            case_id=submission_data.case_id,
            submission_id=submission_id,
            message=f"Successfully submitted {len(created_forms)} forms"
        )

    except Exception as e:
        return BulkSubmissionResponse(
            success=False,
            case_id=submission_data.case_id,
            message=f"Failed to submit forms: {str(e)}",
            errors={"general": [str(e)]}
        )


@router.post("/partial-submit", response_model=BulkSubmissionResponse)
async def partial_submit_form(
    submission_data: PartialFormSubmission,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Submit individual form data (partial submission).
    """
    try:
        # Create or update form entry
        form_create = FormCreate(
            template_id=submission_data.form_name,
            volunteer_id=UUID(submission_data.case_id),  # Using case_id as volunteer_id for now
            data=submission_data.form_data,
            status="draft"
        )
        
        form = await form_service.create_form(
            db=db, obj_in=form_create, created_by=UUID(current_user_id)
        )
        
        return BulkSubmissionResponse(
            success=True,
            case_id=submission_data.case_id,
            submission_id=str(form.id),
            message=f"Successfully submitted {submission_data.form_name}"
        )

    except Exception as e:
        return BulkSubmissionResponse(
            success=False,
            case_id=submission_data.case_id,
            message=f"Failed to submit form: {str(e)}",
            errors={"general": [str(e)]}
        )


@router.post("/sync", response_model=BulkSubmissionResponse)
async def sync_form_data(
    sync_data: FormSyncData,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Sync pending form data from local storage.
    """
    try:
        # Create form entry
        form_create = FormCreate(
            template_id=sync_data.template_id,
            volunteer_id=UUID(sync_data.patient_id),
            data=sync_data.answers,
            status="synced"
        )
        
        form = await form_service.create_form(
            db=db, obj_in=form_create, created_by=UUID(current_user_id)
        )
        
        return BulkSubmissionResponse(
            success=True,
            case_id=sync_data.patient_id,
            submission_id=str(form.id),
            message="Successfully synced form data"
        )

    except Exception as e:
        return BulkSubmissionResponse(
            success=False,
            case_id=sync_data.patient_id,
            message=f"Failed to sync form: {str(e)}",
            errors={"general": [str(e)]}
        )


@router.get("/submission-status/{case_id}")
async def get_submission_status(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get submission status for a case.
    """
    try:
        # Check if forms exist for this case
        forms, total = await form_service.list_forms(
            db=db,
            volunteer_id=UUID(case_id),
            page=1,
            size=1
        )
        
        if total > 0:
            latest_form = forms[0]
            return {
                "submitted": True,
                "submission_id": str(latest_form.id),
                "submitted_at": latest_form.created_at.isoformat(),
                "status": latest_form.status
            }
        else:
            return {"submitted": False}

    except Exception as e:
        return {"submitted": False, "error": str(e)}


@router.post(
    "/", response_model=FormResponse, status_code=status.HTTP_201_CREATED
)
async def create_form(
    form_in: FormCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Create a new form.
    """
    # Verify volunteer exists
    volunteer = await volunteer_service.get_volunteer(db=db, volunteer_id=form_in.volunteer_id)
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer not found"
        )
    
    form = await form_service.create_form(
        db=db, obj_in=form_in, created_by=UUID(current_user_id)
    )
    return form


@router.get("/", response_model=FormPagination)
async def list_forms(
    volunteer_id: Optional[UUID] = None,
    template_id: Optional[UUID] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    pagination: tuple[int, int] = Depends(get_pagination_params),
    current_user: User = Depends(get_current_user),
):
    """
    List forms with optional filters and pagination.
    """
    page, size = pagination
    forms, total = await form_service.list_forms(
        db=db, 
        volunteer_id=volunteer_id,
        template_id=template_id,
        status=status,
        page=page, 
        size=size
    )
    
    # Calculate total pages
    pages = (total + size - 1) // size if size > 0 else 0
    
    return {
        "items": forms,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.get("/{form_id}", response_model=FormResponse)
async def get_form(
    form_id: Annotated[UUID, Path(title="The ID of the form to get")],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific form by ID.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    return form


@router.patch("/{form_id}", response_model=FormResponse)
async def update_form(
    form_id: Annotated[UUID, Path(title="The ID of the form to update")],
    form_in: FormUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Update a form.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    
    updated_form = await form_service.update_form(
        db=db, form_id=form_id, obj_in=form_in, updated_by=UUID(current_user_id)
    )
    return updated_form


@router.post(
    "/{form_id}/table-row", response_model=FormResponse
)
async def add_table_row(
    form_id: Annotated[UUID, Path(title="The ID of the form to update")],
    row_data: TableRowCreate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Add a new row to a table field in a form.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    
    updated_form = await form_service.add_table_row(
        db=db, 
        form_id=form_id, 
        field_path=row_data.field_path,
        row_data=row_data.row_data,
        reason=row_data.reason,
        user_id=UUID(current_user_id)
    )
    return updated_form


@router.patch(
    "/{form_id}/table-cell", response_model=FormResponse
)
async def update_table_cell(
    form_id: Annotated[UUID, Path(title="The ID of the form to update")],
    cell_data: TableCellUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Update a specific cell in a table field.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    
    updated_form = await form_service.update_table_cell(
        db=db, 
        form_id=form_id, 
        field_path=cell_data.field_path,
        row_id=cell_data.row_id,
        column_id=cell_data.column_id,
        value=cell_data.value,
        reason=cell_data.reason,
        user_id=UUID(current_user_id)
    )
    return updated_form


@router.patch("/{form_id}/field", response_model=FormResponse)
async def patch_form_field(
    form_id: Annotated[UUID, Path(title="The ID of the form to patch")],
    patch_data: FormPatch,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id),
):
    """
    Update a specific field in a form and log the change.
    """
    form = await form_service.get_form(db=db, form_id=form_id)
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Form not found"
        )
    
    # Ensure volunteer_id continuity
    if patch_data.field == "volunteer_id":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot change volunteer_id"
        )
    
    # Validate date fields against volunteer.screening_date
    if form.volunteer and form.volunteer.screening_date:
        # This would validate date fields against the volunteer's screening date
        # Implementation depends on the structure of the form data
        pass
    
    updated_form = await form_service.patch_form_field(
        db=db, 
        form_id=form_id, 
        patch_data=patch_data, 
        changed_by=UUID(current_user_id)
    )
    return updated_form