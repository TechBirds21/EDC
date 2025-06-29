from typing import Dict, List, Optional, Tuple, Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.form import Form
from app.models.volunteer import Volunteer
from app.schemas.form import FormCreate, FormPatch, FormUpdate, TableRowCreate, TableCellUpdate
from app.services.change_log import create_change_log


async def create_form(
    db: AsyncSession, obj_in: FormCreate, created_by: UUID
) -> Form:
    """
    Create a new form
    """
    # Validate that all date fields in data are >= volunteer.screening_date
    if obj_in.data:
        # Get volunteer screening date
        volunteer_query = select(Volunteer).where(Volunteer.id == obj_in.volunteer_id)
        volunteer_result = await db.execute(volunteer_query)
        volunteer = volunteer_result.scalars().first()
        
        if volunteer and volunteer.screening_date:
            # This would validate date fields in the data against the volunteer's screening date
            # Implementation depends on the structure of the form data
            pass
    
    db_obj = Form(
        **obj_in.model_dump(),
        created_by=created_by,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_form(db: AsyncSession, form_id: UUID) -> Optional[Form]:
    """
    Get a form by ID with template and volunteer relationships loaded
    """
    query = (
        select(Form)
        .where(Form.id == form_id)
        .options(joinedload(Form.template), joinedload(Form.volunteer))
    )
    result = await db.execute(query)
    return result.scalars().first()


async def list_forms(
    db: AsyncSession, 
    volunteer_id: Optional[UUID] = None,
    template_id: Optional[UUID] = None,
    status: Optional[str] = None,
    page: int = 1, 
    size: int = 100
) -> Tuple[List[Form], int]:
    """
    List forms with optional filters and pagination
    """
    # Base query
    query = select(Form).options(joinedload(Form.template), joinedload(Form.volunteer))
    count_query = select(func.count()).select_from(Form)
    
    # Apply filters
    if volunteer_id:
        query = query.where(Form.volunteer_id == volunteer_id)
        count_query = count_query.where(Form.volunteer_id == volunteer_id)
    
    if template_id:
        query = query.where(Form.template_id == template_id)
        count_query = count_query.where(Form.template_id == template_id)
    
    if status:
        query = query.where(Form.status == status)
        count_query = count_query.where(Form.status == status)
    
    # Get total count
    total = await db.execute(count_query)
    total_count = total.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(Form.created_at.desc()).offset((page - 1) * size).limit(size)
    
    # Execute query
    result = await db.execute(query)
    forms = result.scalars().all()
    
    return forms, total_count


async def update_form(
    db: AsyncSession, form_id: UUID, obj_in: FormUpdate, updated_by: UUID
) -> Optional[Form]:
    """
    Update a form
    """
    form = await get_form(db, form_id)
    if not form:
        return None
    
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(form, field, value)
    
    await db.commit()
    await db.refresh(form)
    return form


async def add_table_row(
    db: AsyncSession,
    form_id: UUID,
    field_path: str,
    row_data: Dict[str, Any],
    reason: str,
    user_id: UUID,
) -> Optional[Form]:
    """
    Add a new row to a table field in a form
    """
    form = await get_form(db, form_id)
    if not form:
        return None
    
    # Get the current data or initialize if None
    current_data = form.data or {}
    
    # Parse the field path to navigate to the correct field
    path_parts = field_path.split('.')
    current = current_data
    
    # Navigate to the parent object
    for part in path_parts[:-1]:
        if part not in current:
            current[part] = {}
        current = current[part]
    
    # Get the last part which is the field name
    field_name = path_parts[-1]
    
    # Initialize the field as an array if it doesn't exist
    if field_name not in current:
        current[field_name] = []
    
    # Add the new row
    current[field_name].append(row_data)
    
    # Create change log entry
    await create_change_log(
        db=db,
        form_id=form_id,
        field=field_path,
        old=None,  # No old value for a new row
        new=row_data,
        reason=reason,
        changed_by=user_id,
    )
    
    # Update the form
    form.data = current_data
    await db.commit()
    await db.refresh(form)
    return form


async def update_table_cell(
    db: AsyncSession,
    form_id: UUID,
    field_path: str,
    row_id: str,
    column_id: str,
    value: Any,
    reason: str,
    user_id: UUID,
) -> Optional[Form]:
    """
    Update a specific cell in a table field
    """
    form = await get_form(db, form_id)
    if not form:
        return None
    
    # Get the current data or initialize if None
    current_data = form.data or {}
    
    # Parse the field path to navigate to the correct field
    path_parts = field_path.split('.')
    current = current_data
    
    # Navigate to the parent object
    for part in path_parts:
        if part not in current:
            current[part] = []
        current = current[part]
    
    # Find the row by ID
    row_index = -1
    for i, row in enumerate(current):
        if row.get('id') == row_id:
            row_index = i
            break
    
    if row_index == -1:
        # Row not found
        return None
    
    # Initialize cells object if it doesn't exist
    if 'cells' not in current[row_index]:
        current[row_index]['cells'] = {}
    
    # Get the old value for the change log
    old_value = current[row_index]['cells'].get(column_id)
    
    # Update the cell value
    current[row_index]['cells'][column_id] = value
    
    # Create change log entry
    await create_change_log(
        db=db,
        form_id=form_id,
        field=f"{field_path}.{row_id}.{column_id}",
        old=old_value,
        new=value,
        reason=reason,
        changed_by=user_id,
    )
    
    # Update the form
    form.data = current_data
    await db.commit()
    await db.refresh(form)
    return form


async def patch_form_field(
    db: AsyncSession, form_id: UUID, patch_data: FormPatch, changed_by: UUID
) -> Optional[Form]:
    """
    Update a specific field in a form and log the change
    """
    form = await get_form(db, form_id)
    if not form:
        return None
    
    # Get the current data or initialize if None
    current_data = form.data or {}
    
    # Get the old value
    old_value = current_data.get(patch_data.field)
    
    # Update the field
    if form.data is None:
        form.data = {}
    
    # Handle nested fields using dot notation
    if "." in patch_data.field:
        parts = patch_data.field.split(".")
        current = form.data
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = patch_data.value
    else:
        form.data[patch_data.field] = patch_data.value
    
    # Create change log entry
    await create_change_log(
        db=db,
        form_id=form_id,
        field=patch_data.field,
        old=old_value,
        new=patch_data.value,
        reason=patch_data.reason,
        changed_by=changed_by,
    )
    
    await db.commit()
    await db.refresh(form)
    return form


async def delete_form(db: AsyncSession, form_id: UUID) -> bool:
    """
    Delete a form
    """
    form = await get_form(db, form_id)
    if not form:
        return False
    
    await db.delete(form)
    await db.commit()
    return True