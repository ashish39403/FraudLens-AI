
from sqlmodel import Field ,Session , create_engine , SQLModel  , select
from datetime import datetime , timezone
from decimal import Decimal
from app.models.enums import TransactionDirection ,TransactionStatus ,TransactionType

# Transaction model



class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"
    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customers.id", index=True)
    counterparty_name: str
    counterparty_account: str
    direction: TransactionDirection
    amount: Decimal = Field(max_digits=18, decimal_places=2)
    currency: str
    transaction_type: TransactionType
    status: TransactionStatus
    occurred_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))