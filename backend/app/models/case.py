from datetime import datetime, timezone

from sqlmodel import Field, SQLModel

from app.models.enums import CasePriority, CaseStatus


class Case(SQLModel, table=True):
    __tablename__ = "cases"

    id: int | None = Field(default=None, primary_key=True)
    alert_id: int = Field(foreign_key="alerts.id", index=True)
    transaction_id: int = Field(foreign_key="transactions.id", index=True)
    customer_id: int = Field(foreign_key="customers.id", index=True)
    assigned_to_user_id: int | None = Field(default=None, foreign_key="users.id", index=True)

    title: str
    description: str
    status: CaseStatus = Field(default=CaseStatus.OPEN)
    priority: CasePriority = Field(default=CasePriority.MEDIUM)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    closed_at: datetime | None = None
