from datetime import datetime

from sqlmodel import SQLModel


class AIInvestigationRead(SQLModel):
    id: int
    transaction_id: int
    customer_id: int
    created_by_user_id: int | None
    risk_level: str
    risk_score: int
    summary: str
    suspicious_patterns: list[str]
    evidence: list[str]
    recommended_action: str
    confidence: str
    model_name: str
    prompt_version: str
    created_at: datetime
