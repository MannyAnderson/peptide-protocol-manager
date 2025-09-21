# app/api/v1/__init__.py
from fastapi import APIRouter
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.ping_db import router as ping_db_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(ping_db_router, tags=["debug"])

