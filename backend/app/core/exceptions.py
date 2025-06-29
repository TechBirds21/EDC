from typing import Any, Dict, Optional

from fastapi import HTTPException, status


class BaseAPIException(HTTPException):
    """
    Base API exception class
    """
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "An unexpected error occurred"
    
    def __init__(
        self, 
        detail: Optional[str] = None, 
        status_code: Optional[int] = None,
        headers: Optional[Dict[str, Any]] = None
    ):
        self.status_code = status_code or self.status_code
        self.detail = detail or self.detail
        super().__init__(status_code=self.status_code, detail=self.detail, headers=headers)


class NotFoundException(BaseAPIException):
    """
    Exception raised when a resource is not found
    """
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Resource not found"


class UnauthorizedException(BaseAPIException):
    """
    Exception raised when a user is not authorized
    """
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Not authenticated"


class ForbiddenException(BaseAPIException):
    """
    Exception raised when a user is forbidden from accessing a resource
    """
    status_code = status.HTTP_403_FORBIDDEN
    detail = "Not enough permissions"


class BadRequestException(BaseAPIException):
    """
    Exception raised when a request is invalid
    """
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid request"


class ValidationException(BadRequestException):
    """
    Exception raised when validation fails
    """
    detail = "Validation error"