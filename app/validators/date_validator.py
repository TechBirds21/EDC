from datetime import date
from typing import Any, Dict, Optional

from pydantic import ValidationError


def validate_date_fields(
    data: Dict[str, Any], screening_date: Optional[date]
) -> Dict[str, Any]:
    """
    Validate that all date fields in data are >= screening_date
    
    Args:
        data: The form data to validate
        screening_date: The volunteer's screening date
        
    Returns:
        The validated data
        
    Raises:
        ValidationError: If any date field is < screening_date
    """
    if not screening_date or not data:
        return data
    
    errors = []
    
    def validate_nested(nested_data: Dict[str, Any], path: str = ""):
        for key, value in nested_data.items():
            current_path = f"{path}.{key}" if path else key
            
            if isinstance(value, dict):
                validate_nested(value, current_path)
            elif isinstance(value, str) and is_date_string(value):
                try:
                    field_date = date.fromisoformat(value)
                    if field_date < screening_date:
                        errors.append(
                            f"Date field '{current_path}' ({value}) must be >= screening date ({screening_date})"
                        )
                except ValueError:
                    # Not a valid date string, skip validation
                    pass
    
    validate_nested(data)
    
    if errors:
        raise ValidationError(errors, model=None)
    
    return data


def is_date_string(value: str) -> bool:
    """
    Check if a string is a valid ISO date format (YYYY-MM-DD)
    """
    if not isinstance(value, str):
        return False
    
    # Simple check for ISO date format
    parts = value.split("-")
    if len(parts) != 3:
        return False
    
    try:
        year, month, day = map(int, parts)
        date(year, month, day)
        return True
    except (ValueError, TypeError):
        return False