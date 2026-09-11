from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


class AIInvestigation(SQLModel, table=True):
    __tablename__ = "ai_investigations"

    id: int | None = Field(default=None, primary_key=True)

    transaction_id: int = Field(foreign_key="transactions.id", index=True)
    customer_id: int = Field(foreign_key="customers.id", index=True)
    created_by_user_id: int | None = Field(default=None, foreign_key="users.id", index=True)

    risk_level: str
    risk_score: int

    summary: str
    suspicious_patterns: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    evidence: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    recommended_action: str
    confidence: str

    model_name: str
    prompt_version: str = "v1"

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))