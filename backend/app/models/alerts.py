
from sqlmodel import Session ,Field , SQLModel , create_engine
from app.models.transaction import Transaction
from datetime import datetime , timezone
from app.models.enums import AlertSeverity , AlertStatus



class Alerts(SQLModel, table=True):
    __tablename__ = "alerts"
    id: int | None = Field(default=None, primary_key=True)
    transaction_id: int = Field(foreign_key="transactions.id", index=True)
    customer_id: int = Field(foreign_key="customers.id", index=True)
    rule_name: str
    severity: AlertSeverity
    status: AlertStatus = Field(default=AlertStatus.OPEN)
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at :datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
