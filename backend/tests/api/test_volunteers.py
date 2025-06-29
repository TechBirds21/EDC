import uuid
from datetime import date

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.volunteer import Volunteer


@pytest.mark.asyncio
async def test_create_volunteer(client: AsyncClient, db: AsyncSession, monkeypatch):
    # Mock authentication
    async def mock_call(self, request):
        request.state.user = type('User', (), {'id': str(uuid.uuid4()), 'role': 'admin'})
        return None
    
    monkeypatch.setattr("app.core.security.SupabaseAuth.__call__", mock_call)
    
    # Test data
    volunteer_data = {
        "screening_date": str(date.today()),
        "dob": "1990-01-01",
        "gender": "Male",
        "bmi": 22.5
    }
    
    # Make request
    response = await client.post("/api/volunteers/", json=volunteer_data)
    
    # Assertions
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["screening_date"] == volunteer_data["screening_date"]
    assert data["dob"] == volunteer_data["dob"]
    assert data["gender"] == volunteer_data["gender"]
    assert data["bmi"] == volunteer_data["bmi"]


@pytest.mark.asyncio
async def test_get_volunteer(client: AsyncClient, db: AsyncSession, monkeypatch):
    # Mock authentication
    async def mock_call(self, request):
        request.state.user = type('User', (), {'id': str(uuid.uuid4()), 'role': 'admin'})
        return None
    
    monkeypatch.setattr("app.core.security.SupabaseAuth.__call__", mock_call)
    
    # Create a volunteer in the database
    volunteer_id = uuid.uuid4()
    volunteer = Volunteer(
        id=volunteer_id,
        screening_date=date.today(),
        dob=date(1990, 1, 1),
        gender="Female",
        bmi=23.5,
        created_by=uuid.uuid4()
    )
    db.add(volunteer)
    await db.commit()
    
    # Make request
    response = await client.get(f"/api/volunteers/{volunteer_id}")
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(volunteer_id)
    assert data["gender"] == "Female"
    assert data["bmi"] == 23.5