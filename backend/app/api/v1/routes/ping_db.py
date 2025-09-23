"""Simple database sanity check route.

We read a single row from an example table to verify database access works.
Change the table name if your database is empty.
"""
from fastapi import APIRouter, HTTPException
from app.utils.supabase import get_supabase

router = APIRouter()

@router.get("/ping-db")
def ping_db():
    # 1) Create a Supabase client
    sb = get_supabase()
    try:
        # 2) Try reading 1 profile row just to sanity check (adjust table if empty)
        data = sb.table("profiles").select("*").limit(1).execute()
        # 3) Return a small summary
        return {"ok": True, "rows": len(data.data), "sample": data.data}
    except Exception as e:
        # 4) Bubble up any error as HTTP 500
        raise HTTPException(status_code=500, detail=str(e))
