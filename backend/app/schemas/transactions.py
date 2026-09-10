from datetime import datetime
from decimal import Decimal

from sqlmodel import SQLModel

from app.models.enums import TransactionDirection, TransactionStatus, TransactionType


class TransactionCreate(SQLModel):
    customer_id: int
    counterparty_name: str
    counterparty_account: str
    direction: TransactionDirection
    amount: Decimal
    currency: str
    transaction_type: TransactionType
    status: TransactionStatus
    occurred_at: datetime


class TransactionRead(SQLModel):
    id: int
    customer_id: int
    counterparty_name: str
    counterparty_account: str
    direction: TransactionDirection
    amount: Decimal
    currency: str
    transaction_type: TransactionType
    status: TransactionStatus
    occurred_at: datetime
    created_at: datetime