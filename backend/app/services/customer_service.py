from sqlmodel import Session, select

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def create_customer(session: Session, customer_data: CustomerCreate) -> Customer:
    customer = Customer(**customer_data.model_dump())

    session.add(customer)
    session.commit()
    session.refresh(customer)

    return customer


def list_customers(session: Session) -> list[Customer]:
    statement = select(Customer)
    return list(session.exec(statement).all())


def get_customer_by_id(session: Session, customer_id: int) -> Customer | None:
    return session.get(Customer, customer_id)