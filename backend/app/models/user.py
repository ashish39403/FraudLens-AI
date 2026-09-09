
from sqlmodel import Field ,   SQLModel
from datetime import datetime , timezone
from app.models.enums import UserRole

# user model

class User(SQLModel , table  =True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    full_name :str = Field(max_length=225)
    email:str = Field(unique=True , index=True)
    role: UserRole = Field(default=UserRole.ANALYST)
    created_at :datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    updated_at :datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    is_active :bool = Field(default=True)
    