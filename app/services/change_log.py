from typing import Any, List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.change_log import ChangeLog


async def create_change_log(
    db: AsyncSession,
    form_id: UUID,
    field: str,
    old: Any,
    new: Any,
    reason: str,
    changed_by: UUID,
) -> ChangeLog:
    """
    Create a new change log entry
    """
    db_obj = ChangeLog(
        form_id=form_id,
        field=field,
        old=old,
        new=new,
        reason=reason,
        changed_by=changed_by,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_change_log(db: AsyncSession, change_log_id: UUID) -> Optional[ChangeLog]:
    """
    Get a change log entry by ID
    """
    result = await db.execute(
        select(ChangeLog)
        .where(ChangeLog.id == change_log_id)
        .options(joinedload(ChangeLog.form))
    )
    return result.scalars().first()


async def list_changes(
    db: AsyncSession, form_id: UUID, page: int = 1, size: int = 100
) -> Tuple[List[ChangeLog], int]:
    """
    List change log entries for a form with pagination
    """
    # Base query
    query = select(ChangeLog).where(ChangeLog.form_id == form_id)
    count_query = select(func.count()).select_from(ChangeLog).where(ChangeLog.form_id == form_id)
    
    # Get total count
    total = await db.execute(count_query)
    total_count = total.scalar() or 0
    
    # Apply pagination and ordering
    query = query.order_by(ChangeLog.changed_at.desc()).offset((page - 1) * size).limit(size)
    
    # Execute query
    result = await db.execute(query)
    changes = result.scalars().all()
    
    return changes, total_count