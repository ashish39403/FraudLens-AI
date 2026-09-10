from fastapi import FastAPI
from app.api.routes.health import  router as health_router
from app.api.routes.customers import router as customers_router
from app.api.routes.transactions import router as transaction_router


app = FastAPI(title="Fraud AML Investigation Platform")


app.include_router(health_router)
app.include_router(customers_router)
app.include_router(transaction_router)