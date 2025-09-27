# app/api/v1/__init__.py
from fastapi import APIRouter
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.ping_db import router as ping_db_router
from app.api.v1.routes.insights import router as insights_router
from app.api.v1.routes.export import router as export_router
from app.api.v1.routes.tracking import router as tracking_router
from app.api.v1.routes.peptides import router as peptides_router
from app.api.v1.routes.supplements import router as supplements_router
from app.api.v1.routes.schedule import router as schedule_router
from app.api.v1.routes.cycles import router as cycles_router
from app.api.v1.routes.labs import router as labs_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(ping_db_router, tags=["debug"])
api_router.include_router(insights_router, tags=["insights"])
api_router.include_router(export_router, tags=["export"])
api_router.include_router(tracking_router, prefix="/tracking")
api_router.include_router(peptides_router, prefix="/peptides")
api_router.include_router(supplements_router, prefix="/supplements")
api_router.include_router(schedule_router, prefix="/schedule")
api_router.include_router(cycles_router, prefix="/cycles")
api_router.include_router(labs_router, prefix="/labs")

