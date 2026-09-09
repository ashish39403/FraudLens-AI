from typing import Annotated
from fastapi import APIRouter , HTTPException , status ,Depends
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.customer import CustomerCreate, CustomerRead
from app.services.customer_service import (
    create_customer,
    get_customer_by_id,
    list_customers,
)





router = APIRouter(prefix="/api/v1/customers" , tags =["customers"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("" , response_model=CustomerRead , status_code=status.HTTP_201_CREATED)
def create_customer_endpoint(payload: CustomerCreate , session:SessionDep):
    return create_customer(session , payload)





@router.get("" , response_model= list[CustomerRead])
def list_customer_endpoint(session:SessionDep):
    return list_customers(session)

@router.get("/{customer_id}" , response_model=CustomerRead)
def get_customer_endpoint(customer_id:int , session:SessionDep):
    customer = get_customer_by_id(session , customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found",)
    return customer