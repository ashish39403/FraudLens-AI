from fastapi import FastAPI
from app.api.routes.ai import router as ai_router
from app.api.routes.auth import router as auth_router
from app.api.routes.health import  router as health_router
from app.api.routes.customers import router as customers_router
from app.api.routes.transactions import router as transaction_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.cases import router as cases_router

app = FastAPI(title="Fraud AML Investigation Platform")


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(transaction_router)
app.include_router(ai_router)
app.include_router(alerts_router)
app.include_router(cases_router)
