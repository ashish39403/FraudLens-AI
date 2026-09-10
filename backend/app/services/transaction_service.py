from sqlmodel import Session, select

from app.models.customer import Customer
from app.models.transaction import Transaction
from app.schemas.transactions import TransactionCreate


def create_transaction(session: Session, transaction_data: TransactionCreate) -> Transaction | None:
    customer = session.get(Customer, transaction_data.customer_id)

    if customer is None:
        return None

    transaction = Transaction(**transaction_data.model_dump())

    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    return transaction


def list_transactions(session: Session) -> list[Transaction]:
    statement = select(Transaction)
    return list(session.exec(statement).all())


def get_transaction_by_id(session: Session, transaction_id: int) -> Transaction | None:
    return session.get(Transaction, transaction_id)


def list_transactions_by_customer(session: Session, customer_id: int) -> list[Transaction] | None:
    customer = session.get(Customer, customer_id)

    if customer is None:
        return None

    statement = select(Transaction).where(Transaction.customer_id == customer_id)
    return list(session.exec(statement).all())