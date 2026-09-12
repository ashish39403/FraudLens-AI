from fastapi import APIRouter, status

from app.ai.investigation_service import investigate_transaction
from app.api.deps import CurrentUserDep, SessionDep
from app.schemas.ai import AIInvestigationRead


router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post(
    "/investigate/transactions/{transaction_id}",
    response_model=AIInvestigationRead,
    status_code=status.HTTP_201_CREATED,
)
def investigate_transaction_endpoint(
    transaction_id: int,
    session: SessionDep,
    current_user: CurrentUserDep,
):
    return investigate_transaction(
        session=session,
        transaction_id=transaction_id,
        current_user=current_user,
    )
