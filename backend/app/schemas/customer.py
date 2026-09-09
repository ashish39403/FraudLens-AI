from datetime import datetime

from sqlmodel import SQLModel

from app.models.enums import CustomerType, KycStatus, RiskLevel


# for validating the input..

class CustomerCreate(SQLModel):
    external_customer_id:str
    full_name:str
    customer_type:CustomerType
    country:str
    kyc_status:KycStatus
    risk_level:RiskLevel
    
class CustomerRead(SQLModel):
    id: int
    external_customer_id: str
    full_name: str
    customer_type: CustomerType
    country: str
    kyc_status: KycStatus
    risk_level: RiskLevel
    created_at: datetime
    updated_at: datetime