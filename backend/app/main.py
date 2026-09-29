from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1 import auth, users, perfumes, sales, dashboard

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="API de registro de ventas de perfumes — Scentia",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(perfumes.router, prefix="/api/v1/perfumes", tags=["Perfumes"])
app.include_router(sales.router, prefix="/api/v1/sales", tags=["Sales"])
app.include_router(dashboard.router, 
                   prefix="/api/v1/dashboard", tags=["Dashboard"])


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}