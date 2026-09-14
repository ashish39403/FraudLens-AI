from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.db.session import get_session
from app.services import alert_service
from app.schemas.alert import AlertCreate, AlertRead, AlertUpdate
from app.models.enums import AlertStatus, AlertSeverity

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.post("/", response_model=AlertRead)
def create_alert(alert: AlertCreate, session: Session = Depends(get_session)):
    """Naya alert banao"""
    return alert_service.create_alert(session, alert)


@router.get("/", response_model=list[AlertRead])
def list_alerts(
    status: AlertStatus | None = Query(default=None),
    severity: AlertSeverity | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
    session: Session = Depends(get_session),
):
    """Filters ke saath alerts list karo"""
    return alert_service.get_alerts(
        session,
        status=status,
        severity=severity,
        customer_id=customer_id,
        skip=skip,
        limit=limit,
    )


@router.get("/{alert_id}", response_model=AlertRead)
def get_alert(alert_id: int, session: Session = Depends(get_session)):
    """Ek specific alert fetch karo"""
    alert = alert_service.get_alert(session, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}", response_model=AlertRead)
def update_alert(alert_id: int, alert_update: AlertUpdate, session: Session = Depends(get_session)):
    """Alert update karo (status change, review, etc.)"""
    updated = alert_service.update_alert(session, alert_id, alert_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Alert not found")
    return updated


@router.delete("/{alert_id}")
def delete_alert(alert_id: int, session: Session = Depends(get_session)):
    """Alert delete karo"""
    deleted = alert_service.delete_alert(session, alert_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted successfully"}
