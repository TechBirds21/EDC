from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.form_template import FormTemplate
from app.schemas.form_template import FormTemplateCreate, FormTemplateUpdate


async def create_template(
    db: AsyncSession, obj_in: FormTemplateCreate, created_by: UUID
) -> FormTemplate:
    """
    Create a new form template
    """
    db_obj = FormTemplate(
        **obj_in.model_dump(),
        created_by=created_by,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_template(db: AsyncSession, template_id: UUID) -> Optional[FormTemplate]:
    """
    Get a form template by ID
    """
    result = await db.execute(select(FormTemplate).where(FormTemplate.id == template_id))
    return result.scalars().first()


async def list_templates(
    db: AsyncSession, name: Optional[str] = None, page: int = 1, size: int = 100
) -> Tuple[List[FormTemplate], int]:
    """
    List form templates with optional name filter and pagination
    """
    # Base query
    query = select(FormTemplate)
    count_query = select(func.count()).select_from(FormTemplate)
    
    # Apply name filter if provided
    if name:
        query = query.where(FormTemplate.name.ilike(f"%{name}%"))
        count_query = count_query.where(FormTemplate.name.ilike(f"%{name}%"))
    
    # Get total count
    total = await db.execute(count_query)
    total_count = total.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(FormTemplate.created_at.desc()).offset((page - 1) * size).limit(size)
    
    # Execute query
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return templates, total_count


async def update_template(
    db: AsyncSession, template_id: UUID, obj_in: FormTemplateUpdate
) -> Optional[FormTemplate]:
    """
    Update a form template
    """
    template = await get_template(db, template_id)
    if not template:
        return None
    
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    await db.commit()
    await db.refresh(template)
    return template


async def delete_template(db: AsyncSession, template_id: UUID) -> bool:
    """
    Delete a form template
    """
    template = await get_template(db, template_id)
    if not template:
        return False
    
    await db.delete(template)
    await db.commit()
    return True