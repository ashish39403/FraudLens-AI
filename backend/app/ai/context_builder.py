from fastapi import HTTPException
from sqlmodel import Session, select
from fastapi import status
from app.ai.schemas import AIInvestigationContext
from app.models.customer import Customer
from app.models.transaction import Transaction


def build_investigation_context(session:Session , transaction_id:int)->AIInvestigationContext:
    transaction = session.get(Transaction , transaction_id)
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail="Transaction not found")
    
    customer = session.get(Customer , transaction.customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND , detail="Customer not found")
    
    related_transactions = session.exec(
        select(Transaction).where(Transaction.customer_id == customer.id)
    ).all()
    
    return AIInvestigationContext(
        transaction_id=transaction.id,
        customer_id=customer.id,
        customer_risk_level=customer.risk_level.value,
        transaction_amount=float(transaction.amount),
        transaction_type=transaction.transaction_type.value,
        transaction_direction=transaction.direction.value,
        transaction_country=customer.country,
        related_transactions_count=len(related_transactions),
    )