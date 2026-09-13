from sqlmodel import Session, select
from app.models.alerts import Alerts
from app.models.enums import AlertSeverity, AlertStatus
from app.schemas.alert import AlertCreate, AlertUpdate


def create_alert(session: Session, alert_data: AlertCreate) -> Alerts:
    """Save new alert in the Database"""
    db_alert = Alerts(**alert_data.model_dump())
    session.add(db_alert)
    session.commit()
    session.refresh(db_alert)
    return db_alert


def get_alert(session: Session, alert_id: int) -> Alerts | None:
    """ID se ek alert fetch karo"""
    return session.get(Alerts, alert_id)


def get_alerts(
    session: Session,
    status: AlertStatus | None = None,
    severity: AlertSeverity | None = None,
    customer_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Alerts]:
    """List alerts with filters"""
    query = select(Alerts)

    if status:
        query = query.where(Alerts.status == status)
    if severity:
        query = query.where(Alerts.severity == severity)
    if customer_id:
        query = query.where(Alerts.customer_id == customer_id)

    query = query.offset(skip).limit(limit)
    return session.exec(query).all()


def update_alert(session: Session, alert_id: int, alert_data: AlertUpdate) -> Alerts | None:
    """Alert update  (status change, review, etc.)"""
    db_alert = session.get(Alerts, alert_id)
    if not db_alert:
        return None

    update_data = alert_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_alert, key, value)

    session.add(db_alert)
    session.commit()
    session.refresh(db_alert)
    return db_alert


def delete_alert(session: Session, alert_id: int) -> bool:
    """Alert delete """
    db_alert = session.get(Alerts, alert_id)
    if not db_alert:
        return False
    session.delete(db_alert)
    session.commit()
    return True