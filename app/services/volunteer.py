from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.volunteer import Volunteer
from app.schemas.volunteer import VolunteerCreate, VolunteerUpdate


async def create_volunteer(
    db: AsyncSession, obj_in: VolunteerCreate, created_by: UUID
) -> Volunteer:
    """
    Create a new volunteer
    """
    db_obj = Volunteer(
        **obj_in.model_dump(),
        created_by=created_by,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def get_volunteer(db: AsyncSession, volunteer_id: UUID) -> Optional[Volunteer]:
    """
    Get a volunteer by ID
    """
    result = await db.execute(select(Volunteer).where(Volunteer.id == volunteer_id))
    return result.scalars().first()


async def get_volunteer_by_ids(
    db: AsyncSession, volunteer_id: str, study_number: str
) -> Optional[Volunteer]:
    """
    Get a volunteer by volunteer_id and study_number
    """
    result = await db.execute(
        select(Volunteer).where(
            Volunteer.volunteer_id == volunteer_id,
            Volunteer.study_number == study_number
        )
    )
    return result.scalars().first()


async def list_volunteers(
    db: AsyncSession, page: int = 1, size: int = 100
) -> Tuple[List[Volunteer], int]:
    """
    List volunteers with pagination
    """
    # Get total count
    count_query = select(func.count()).select_from(Volunteer)
    total = await db.execute(count_query)
    total_count = total.scalar() or 0

    # Get paginated results
    query = select(Volunteer).order_by(Volunteer.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    volunteers = result.scalars().all()

    return volunteers, total_count


async def update_volunteer(
    db: AsyncSession, volunteer_id: UUID, obj_in: VolunteerUpdate
) -> Optional[Volunteer]:
    """
    Update a volunteer
    """
    volunteer = await get_volunteer(db, volunteer_id)
    if not volunteer:
        return None

    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(volunteer, field, value)

    await db.commit()
    await db.refresh(volunteer)
    return volunteer


async def delete_volunteer(db: AsyncSession, volunteer_id: UUID) -> bool:
    """
    Delete a volunteer
    """
    volunteer = await get_volunteer(db, volunteer_id)
    if not volunteer:
        return False

    await db.delete(volunteer)
    await db.commit()
    return True