from typing import Dict, Any, Optional, UUID
from uuid import UUID as UUIDType
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func

from app.models.unified_models import AuditLog

async def log_activity(
    db: AsyncSession,
    action: str,
    resource_type: str,
    resource_id: UUIDType,
    user_id: Optional[UUIDType] = None,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
    field_changes: Optional[Dict[str, Any]] = None,
    reason: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    session_id: Optional[str] = None,
    form_id: Optional[UUIDType] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Log an activity to the audit trail
    """
    # Calculate field changes if both old and new values are provided
    if old_values and new_values and not field_changes:
        field_changes = {}
        for key in set(old_values.keys()) | set(new_values.keys()):
            old_val = old_values.get(key)
            new_val = new_values.get(key)
            if old_val != new_val:
                field_changes[key] = {
                    "old": old_val,
                    "new": new_val
                }
    
    # Merge details into new_values if provided
    if details and new_values:
        new_values.update(details)
    elif details and not new_values:
        new_values = details
    
    audit_log = AuditLog(
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        user_id=user_id,
        old_values=old_values,
        new_values=new_values,
        field_changes=field_changes,
        reason=reason,
        ip_address=ip_address,
        user_agent=user_agent,
        session_id=session_id,
        form_id=form_id
    )
    
    db.add(audit_log)
    # Note: commit should be handled by the caller
    
    return audit_log

async def get_audit_trail(
    db: AsyncSession,
    resource_type: Optional[str] = None,
    resource_id: Optional[UUIDType] = None,
    user_id: Optional[UUIDType] = None,
    action: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> list[AuditLog]:
    """
    Get audit trail with optional filters
    """
    from sqlalchemy import select, desc
    from sqlalchemy.orm import selectinload
    
    query = select(AuditLog).options(selectinload(AuditLog.user))
    
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    
    if resource_id:
        query = query.where(AuditLog.resource_id == resource_id)
    
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
        
    if action:
        query = query.where(AuditLog.action == action)
    
    query = query.order_by(desc(AuditLog.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    return result.scalars().all()