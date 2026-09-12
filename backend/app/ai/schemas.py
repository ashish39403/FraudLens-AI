from pydantic import BaseModel, Field


class AIInvestigationContext(BaseModel):
    transaction_id: int
    customer_id: int
    customer_risk_level: str
    transaction_amount: float
    transaction_type: str
    transaction_direction: str
    transaction_country: str | None = None
    related_transactions_count: int = 0


class RiskSignal(BaseModel):
    name: str
    severity: str
    description: str


class AIInvestigationResult(BaseModel):
    risk_level: str = Field(description="LOW, MEDIUM, or HIGH")
    risk_score: int = Field(ge=0, le=100)
    summary: str
    suspicious_patterns: list[str]
    evidence: list[str]
    recommended_action: str
    confidence: str = Field(description="LOW, MEDIUM, or HIGH")
    data_gaps: list[str] = Field(default_factory=list)
    edge_cases_or_contradictions: list[str] = Field(default_factory=list)
    
    
#     AIInvestigationContext = jo data AI ko diya jayega
# RiskSignal = rule-based factual signals
# AIInvestigationResult = AI ka final structured output
