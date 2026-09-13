from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.models.alerts import AlertSeverity, AlertStatus


# ---------- INPUT SCHEMAS ----------

class AlertCreate(BaseModel):
    """Creating the New Alert"""
    transaction_id: int
    customer_id: int
    rule_name: str
    severity: AlertSeverity
    description: str
    status: AlertStatus = AlertStatus.OPEN  # optional, default OPEN


class AlertUpdate(BaseModel):
    """Updating the Alert (Fields are optional)"""
    rule_name: str | None = None
    severity: AlertSeverity | None = None
    status: AlertStatus | None = None
    description: str | None = None


# ---------- OUTPUT SCHEMA ----------

class AlertRead(BaseModel):
    """Response the API will Give"""
    id: int
    transaction_id: int
    customer_id: int
    rule_name: str
    severity: AlertSeverity
    status: AlertStatus
    description: str
    created_at: datetime
    updated_at: datetime

    # model_config = ConfigDict(from_attributes=True)  # SQLModel object se direct convert karne ke liye