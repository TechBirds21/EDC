from typing import Any, Dict, List, Optional, Tuple, Union


def compare_values(old: Any, new: Any) -> bool:
    """
    Compare two values and return True if they are different
    """
    # Handle None values
    if old is None and new is None:
        return False
    if old is None or new is None:
        return True
    
    # Handle different types
    if type(old) != type(new):
        return True
    
    # Handle dictionaries
    if isinstance(old, dict) and isinstance(new, dict):
        # Check if keys are different
        if set(old.keys()) != set(new.keys()):
            return True
        
        # Check each key-value pair
        for key in old:
            if compare_values(old[key], new[key]):
                return True
        
        return False
    
    # Handle lists
    if isinstance(old, list) and isinstance(new, list):
        if len(old) != len(new):
            return True
        
        for i in range(len(old)):
            if i >= len(new) or compare_values(old[i], new[i]):
                return True
        
        return False
    
    # Handle simple values
    return old != new


def get_field_changes(
    old_data: Optional[Dict[str, Any]], new_data: Optional[Dict[str, Any]]
) -> List[Tuple[str, Any, Any]]:
    """
    Compare old and new data and return a list of changes
    
    Args:
        old_data: The old data
        new_data: The new data
        
    Returns:
        A list of tuples (field_path, old_value, new_value)
    """
    changes = []
    
    if old_data is None:
        old_data = {}
    if new_data is None:
        new_data = {}
    
    def compare_nested(
        old: Dict[str, Any], new: Dict[str, Any], path: str = ""
    ) -> None:
        # Check keys in old that are changed or removed in new
        for key in old:
            current_path = f"{path}.{key}" if path else key
            
            if key not in new:
                # Field was removed
                changes.append((current_path, old[key], None))
            elif isinstance(old[key], dict) and isinstance(new[key], dict):
                # Recurse into nested dictionaries
                compare_nested(old[key], new[key], current_path)
            elif compare_values(old[key], new[key]):
                # Value changed
                changes.append((current_path, old[key], new[key]))
        
        # Check keys in new that are not in old
        for key in new:
            if key not in old:
                current_path = f"{path}.{key}" if path else key
                changes.append((current_path, None, new[key]))
    
    compare_nested(old_data, new_data)
    return changes