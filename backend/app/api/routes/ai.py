from fastapi import APIRouter, HTTPException, Query, Response, status

from app.ai.exceptions import AIProviderError
from app.ai.investigation_service import investigate_transaction
from app.api.deps import CurrentUserDep, SessionDep
from app.schemas.ai import AIInvestigationRead
from app.services.ai_report_service import (
    build_ai_report_pdf,
    get_ai_report,
    list_ai_reports,
)


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
    try:
        return investigate_transaction(
            session=session,
            transaction_id=transaction_id,
            current_user=current_user,
        )
    except AIProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable",
        ) from exc


@router.get("/investigations", response_model=list[AIInvestigationRead])
def list_ai_investigations_endpoint(
    session: SessionDep,
    current_user: CurrentUserDep,
    transaction_id: int | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    return list_ai_reports(
        session,
        transaction_id=transaction_id,
        customer_id=customer_id,
        skip=skip,
        limit=limit,
    )


@router.get("/investigations/{report_id}", response_model=AIInvestigationRead)
def get_ai_investigation_endpoint(
    report_id: int,
    session: SessionDep,
    current_user: CurrentUserDep,
):
    report = get_ai_report(session, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI report not found")
    return report


@router.get("/investigations/{report_id}/download")
def download_ai_investigation_pdf_endpoint(
    report_id: int,
    session: SessionDep,
    current_user: CurrentUserDep,
):
    report = get_ai_report(session, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI report not found")

    pdf_bytes = build_ai_report_pdf(report)
    filename = f"fraudlens-ai-report-{report.id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
