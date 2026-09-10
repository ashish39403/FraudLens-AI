from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator

from app.models.enums import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.ANALYST

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if not any(char.isupper() for char in password):
            raise ValueError("Password must contain at least one uppercase letter")

        if not any(char.islower() for char in password):
            raise ValueError("Password must contain at least one lowercase letter")

        if not any(char.isdigit() for char in password):
            raise ValueError("Password must contain at least one number")

        return password


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
