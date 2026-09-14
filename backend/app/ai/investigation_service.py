from sqlmodel import Session

from app.ai.graph import investigation_graph
from app.ai.prompts import PROMPT_VERSION
from app.ai.tracing import mark_ai_trace_error, mark_ai_trace_success, trace_ai_investigation
from app.core.config import settings
from app.models.ai_report import AIInvestigation
from app.models.user import User


def investigate_transaction(
    session: Session,
    transaction_id: int,
    current_user: User | None = None,
) -> AIInvestigation:
    user_id = current_user.id if current_user else None

    with trace_ai_investigation(transaction_id=transaction_id, user_id=user_id):
        try:
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
                created_by_user_id=user_id,
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

            mark_ai_trace_success(
                report_id=ai_investigation.id,
                transaction_id=ai_investigation.transaction_id,
                customer_id=ai_investigation.customer_id,
                risk_level=ai_investigation.risk_level,
                risk_score=ai_investigation.risk_score,
                confidence=ai_investigation.confidence,
                prompt_version=ai_investigation.prompt_version,
            )

            return ai_investigation
        except Exception as exc:
            mark_ai_trace_error(exc)
            raise
