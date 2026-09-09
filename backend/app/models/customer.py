from typing import Annotated
from fastapi import Depends , HTTPException , Query , FastAPI
from sqlmodel import Field ,Session , create_engine , SQLModel  , select
from datetime import datetime , timezone
from app.models.enums import CustomerType ,KycStatus ,RiskLevel

# Customer model

class Customer(SQLModel, table=True):
    __tablename__ = "customers"
    id: int | None = Field(default=None, primary_key=True)
    external_customer_id: str = Field(index=True, unique=True)
    full_name: str
    customer_type: CustomerType
    country: str
    kyc_status: KycStatus
    risk_level: RiskLevel
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

