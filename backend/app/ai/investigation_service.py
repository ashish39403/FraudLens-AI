from sqlmodel import Session

from app.ai.graph import investigation_graph
from app.ai.prompts import PROMPT_VERSION
from app.core.config import settings
from app.models.ai_report import AIInvestigation
from app.models.user import User


def investigate_transaction(
    session: Session,
    transaction_id: int,
    current_user: User | None = None,
) -> AIInvestigation:
    graph_result = investigation_graph.invoke(
        {
            "session": session,
            "transaction_id": transaction_id,
        }
    )

    context = graph_result["context"]
    result = graph_result["result"]

    ai_investigation = AIInvestigation(
        transaction_id=context.transaction_id,
        customer_id=context.customer_id,
        created_by_user_id=current_user.id if current_user else None,
        risk_level=result.risk_level,
        risk_score=result.risk_score,
        summary=result.summary,
        suspicious_patterns=result.suspicious_patterns,
        evidence=result.evidence,
        recommended_action=result.recommended_action,
        confidence=result.confidence,
        model_name=settings.ai_model,
        prompt_version=PROMPT_VERSION,
    )

    session.add(ai_investigation)
    session.commit()
    session.refresh(ai_investigation)
    
    return ai_investigation
