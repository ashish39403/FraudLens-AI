from datetime import datetime, timezone

from sqlmodel import Session, select

from app.models.alerts import Alerts
from app.models.case import Case
from app.models.enums import CaseStatus
from app.schemas.case import CaseCreate, CaseUpdate


def create_case(session: Session, case_data: CaseCreate) -> Case | None:
    alert = session.get(Alerts, case_data.alert_id)
    if alert is None:
        return None

    db_case = Case(
        alert_id=alert.id,
        transaction_id=alert.transaction_id,
        customer_id=alert.customer_id,
        assigned_to_user_id=case_data.assigned_to_user_id,
        title=case_data.title,
        description=case_data.description,
        priority=case_data.priority,
    )

    session.add(db_case)
    session.commit()
    session.refresh(db_case)
    return db_case


def get_case(session: Session, case_id: int) -> Case | None:
    return session.get(Case, case_id)


def list_cases(
    session: Session,
    status: CaseStatus | None = None,
    customer_id: int | None = None,
    assigned_to_user_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Case]:
    query = select(Case)

    if status:
        query = query.where(Case.status == status)
    if customer_id:
        query = query.where(Case.customer_id == customer_id)
    if assigned_to_user_id:
        query = query.where(Case.assigned_to_user_id == assigned_to_user_id)

    query = query.offset(skip).limit(limit)
    return list(session.exec(query).all())


def update_case(session: Session, case_id: int, case_data: CaseUpdate) -> Case | None:
    db_case = session.get(Case, case_id)
    if db_case is None:
        return None

    update_data = case_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_case, key, value)

    db_case.updated_at = datetime.now(timezone.utc)
    if case_data.status == CaseStatus.CLOSED and db_case.closed_at is None:
        db_case.closed_at = datetime.now(timezone.utc)

    session.add(db_case)
    session.commit()
    session.refresh(db_case)
    return db_case
