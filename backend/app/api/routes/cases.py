from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.db.session import get_session
from app.models.enums import CaseStatus
from app.schemas.case import CaseCreate, CaseRead, CaseUpdate
from app.services import case_service


router = APIRouter(prefix="/api/v1/cases", tags=["cases"])


@router.post("", response_model=CaseRead, status_code=status.HTTP_201_CREATED)
def create_case_endpoint(case: CaseCreate, session: Session = Depends(get_session)):
    db_case = case_service.create_case(session, case)
    if db_case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return db_case


@router.get("", response_model=list[CaseRead])
def list_cases_endpoint(
    status: CaseStatus | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    assigned_to_user_id: int | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    session: Session = Depends(get_session),
):
    return case_service.list_cases(
        session,
        status=status,
        customer_id=customer_id,
        assigned_to_user_id=assigned_to_user_id,
        skip=skip,
        limit=limit,
    )


@router.get("/{case_id}", response_model=CaseRead)
def get_case_endpoint(case_id: int, session: Session = Depends(get_session)):
    db_case = case_service.get_case(session, case_id)
    if db_case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return db_case


@router.patch("/{case_id}", response_model=CaseRead)
def update_case_endpoint(
    case_id: int,
    case_update: CaseUpdate,
    session: Session = Depends(get_session),
):
    db_case = case_service.update_case(session, case_id, case_update)
    if db_case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return db_case
