from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.transactions import TransactionCreate, TransactionRead
from app.services.transaction_service import (
    create_transaction,
    get_transaction_by_id,
    list_transactions,
    list_transactions_by_customer,
)


router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction_endpoint(payload: TransactionCreate, session: SessionDep):
    transaction = create_transaction(session, payload)

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return transaction


@router.get("", response_model=list[TransactionRead])
def list_transactions_endpoint(session: SessionDep):
    return list_transactions(session)


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction_endpoint(transaction_id: int, session: SessionDep):
    transaction = get_transaction_by_id(session, transaction_id)

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return transaction


@router.get("/customer/{customer_id}", response_model=list[TransactionRead])
def list_customer_transactions_endpoint(customer_id: int, session: SessionDep):
    transactions = list_transactions_by_customer(session, customer_id)

    if transactions is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return transactions