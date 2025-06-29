import uuid
from datetime import date

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.volunteer import VolunteerCreate, VolunteerUpdate
from app.services.volunteer import create_volunteer, get_volunteer, update_volunteer


@pytest.mark.asyncio
async def test_create_volunteer(db: AsyncSession):
    # Test data
    volunteer_data = VolunteerCreate(
        screening_date=date.today(),
        dob=date(1990, 1, 1),
        gender="Male",
        bmi=22.5
    )
    created_by = uuid.uuid4()
    
    # Create volunteer
    volunteer = await create_volunteer(db, volunteer_data, created_by)
    
    # Assertions
    assert volunteer.id is not None
    assert volunteer.screening_date == volunteer_data.screening_date
    assert volunteer.dob == volunteer_data.dob
    assert volunteer.gender == volunteer_data.gender
    assert float(volunteer.bmi) == volunteer_data.bmi
    assert volunteer.created_by == created_by


@pytest.mark.asyncio
async def test_get_volunteer(db: AsyncSession):
    # Create a volunteer
    volunteer_data = VolunteerCreate(
        screening_date=date.today(),
        dob=date(1990, 1, 1),
        gender="Female",
        bmi=23.5
    )
    created_by = uuid.uuid4()
    volunteer = await create_volunteer(db, volunteer_data, created_by)
    
    # Get the volunteer
    retrieved_volunteer = await get_volunteer(db, volunteer.id)
    
    # Assertions
    assert retrieved_volunteer is not None
    assert retrieved_volunteer.id == volunteer.id
    assert retrieved_volunteer.gender == "Female"
    assert float(retrieved_volunteer.bmi) == 23.5


@pytest.mark.asyncio
async def test_update_volunteer(db: AsyncSession):
    # Create a volunteer
    volunteer_data = VolunteerCreate(
        screening_date=date.today(),
        dob=date(1990, 1, 1),
        gender="Male",
        bmi=22.5
    )
    created_by = uuid.uuid4()
    volunteer = await create_volunteer(db, volunteer_data, created_by)
    
    # Update data
    update_data = VolunteerUpdate(
        gender="Female",
        bmi=24.0
    )
    
    # Update the volunteer
    updated_volunteer = await update_volunteer(db, volunteer.id, update_data)
    
    # Assertions
    assert updated_volunteer is not None
    assert updated_volunteer.id == volunteer.id
    assert updated_volunteer.gender == "Female"
    assert float(updated_volunteer.bmi) == 24.0
    assert updated_volunteer.dob == date(1990, 1, 1)  # Unchanged