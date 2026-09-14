from datetime import datetime

from pydantic import BaseModel

from app.models.enums import CasePriority, CaseStatus


class CaseCreate(BaseModel):
    alert_id: int
    title: str
    description: str
    priority: CasePriority = CasePriority.MEDIUM
    assigned_to_user_id: int | None = None


class CaseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: CaseStatus | None = None
    priority: CasePriority | None = None
    assigned_to_user_id: int | None = None


class CaseRead(BaseModel):
    id: int
    alert_id: int
    transaction_id: int
    customer_id: int
    assigned_to_user_id: int | None
    title: str
    description: str
    status: CaseStatus
    priority: CasePriority
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
