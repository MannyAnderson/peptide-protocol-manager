"""Health check endpoints.

We use these routes to quickly verify the API and its dependencies (like the
Supabase client) are ready. This is handy for uptime checks and debugging.
"""
# app/api/v1/routes/health.py
from fastapi import APIRouter
from app.utils.supabase import get_supabase

router = APIRouter()

@router.get("/health")
def health():
    # Minimal connectivity poke: just instantiate client
    supabase = get_supabase()
    # Optional: quick metadata ping (fast and harmless)
    ok = bool(supabase)
    return {"ok": ok, "service": "fastapi", "supabase_client": "ready"}
