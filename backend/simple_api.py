#!/usr/bin/env python3
"""
Simple EDC API for testing without database dependencies
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from pydantic import BaseModel

# Configuration
JWT_SECRET = "your-secret-key-here-replace-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Test users configuration
TEST_USERS = {
    "superadmin@edc.com": {"role": "super_admin", "name": "Super Admin"},
    "admin@edc.com": {"role": "admin", "name": "Admin User"},
    "employee@edc.com": {"role": "employee", "name": "Employee User"},
}

app = FastAPI(
    title="EDC API - Simple Test Version",
    version="1.0.0",
    description="Electronic Data Capture (EDC) API for testing without database",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    first_name: str = ""
    last_name: str = ""

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class FormData(BaseModel):
    template_id: str
    volunteer_id: Optional[str] = None
    study_number: Optional[str] = None
    data: Dict[str, Any]
    status: str = "draft"

class FormResponse(BaseModel):
    id: str
    template_id: str
    volunteer_id: Optional[str] = None
    study_number: Optional[str] = None
    data: Dict[str, Any]
    status: str
    created_at: str
    updated_at: str

class PaginatedResponse(BaseModel):
    items: List[Dict[str, Any]]
    total: int
    page: int
    size: int
    pages: int

# Helper functions
def create_access_token(email: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token for a user."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": email.replace("@", "_").replace(".", "_"),
        "email": email,
        "role": role,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

# Mock data storage (in production this would be database)
mock_forms = {}
next_form_id = 1

# API endpoints
@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin) -> Any:
    """Login endpoint that bypasses password checks for test users."""
    email = user_credentials.email.lower().strip()
    
    # Check if it's a test user
    if email in TEST_USERS:
        # For test users, any password works
        user_info = TEST_USERS[email]
        
        # Create access token
        access_token = create_access_token(
            email=email,
            role=user_info["role"]
        )
        
        user_response = UserResponse(
            id=email.replace("@", "_").replace(".", "_"),
            email=email,
            role=user_info["role"],
            first_name=user_info["name"].split()[0],
            last_name=user_info["name"].split()[-1] if len(user_info["name"].split()) > 1 else ""
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    # For non-test users, reject for now
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. Only test accounts are supported.",
    )

@app.post("/api/auth/logout")
async def logout() -> Any:
    """Logout endpoint - for JWT tokens, logout is handled client-side."""
    return {"message": "Successfully logged out"}

@app.get("/api/auth/me")
async def get_current_user_info() -> Any:
    """Get current user info - placeholder for now."""
    return {"message": "User info endpoint"}

# Forms endpoints
@app.post("/api/forms", response_model=FormResponse)
async def create_form(form_data: FormData) -> Any:
    """Create a new form."""
    global next_form_id
    
    form_id = str(next_form_id)
    next_form_id += 1
    
    now = datetime.utcnow().isoformat()
    
    form = {
        "id": form_id,
        "template_id": form_data.template_id,
        "volunteer_id": form_data.volunteer_id,
        "study_number": form_data.study_number,
        "data": form_data.data,
        "status": form_data.status,
        "created_at": now,
        "updated_at": now
    }
    
    mock_forms[form_id] = form
    
    return FormResponse(**form)

@app.get("/api/forms", response_model=PaginatedResponse)
async def get_forms(
    page: int = 1,
    size: int = 20,
    template_id: Optional[str] = None,
    volunteer_id: Optional[str] = None,
    status: Optional[str] = None
) -> Any:
    """Get forms with pagination and filtering."""
    
    # Filter forms
    filtered_forms = list(mock_forms.values())
    
    if template_id:
        filtered_forms = [f for f in filtered_forms if f.get("template_id") == template_id]
    if volunteer_id:
        filtered_forms = [f for f in filtered_forms if f.get("volunteer_id") == volunteer_id]
    if status:
        filtered_forms = [f for f in filtered_forms if f.get("status") == status]
    
    # Pagination
    total = len(filtered_forms)
    start = (page - 1) * size
    end = start + size
    items = filtered_forms[start:end]
    
    pages = (total + size - 1) // size if size > 0 else 0
    
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@app.get("/api/forms/{form_id}", response_model=FormResponse)
async def get_form(form_id: str) -> Any:
    """Get a specific form."""
    if form_id not in mock_forms:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    return FormResponse(**mock_forms[form_id])

@app.patch("/api/forms/{form_id}", response_model=FormResponse)
async def update_form(form_id: str, form_data: Dict[str, Any]) -> Any:
    """Update a form."""
    if form_id not in mock_forms:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found"
        )
    
    form = mock_forms[form_id]
    
    # Update fields
    if "data" in form_data:
        form["data"] = form_data["data"]
    if "status" in form_data:
        form["status"] = form_data["status"]
    
    form["updated_at"] = datetime.utcnow().isoformat()
    
    return FormResponse(**form)

# Volunteers endpoints (mock)
@app.get("/api/volunteers", response_model=PaginatedResponse)
async def get_volunteers(page: int = 1, size: int = 20) -> Any:
    """Get volunteers."""
    # Mock volunteers data
    volunteers = [
        {"id": "1", "name": "John Doe", "email": "john@example.com"},
        {"id": "2", "name": "Jane Smith", "email": "jane@example.com"},
    ]
    
    return PaginatedResponse(
        items=volunteers,
        total=len(volunteers),
        page=page,
        size=size,
        pages=1
    )

# Form templates endpoints (mock)
@app.get("/api/form-templates", response_model=PaginatedResponse)
async def get_form_templates(page: int = 1, size: int = 20) -> Any:
    """Get form templates."""
    # Mock templates data
    templates = [
        {"id": "volunteer_medical_screening", "name": "Volunteer Medical Screening"},
        {"id": "pregnancy_tests", "name": "Pregnancy Tests"},
        {"id": "laboratory_reports", "name": "Laboratory Reports"},
        {"id": "study_period", "name": "Study Period"},
        {"id": "post_study", "name": "Post Study"},
    ]
    
    return PaginatedResponse(
        items=templates,
        total=len(templates),
        page=page,
        size=size,
        pages=1
    )

# Health check
@app.get("/")
async def root():
    return {"message": "EDC API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)