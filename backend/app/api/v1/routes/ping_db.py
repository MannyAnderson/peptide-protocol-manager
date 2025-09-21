from fastapi import APIRouter, HTTPException
from app.utils.supabase import get_supabase

router = APIRouter()

@router.get("/ping-db")
def ping_db():
    sb = get_supabase()
    try:
        # Try reading 1 profile row just to sanity check (adjust table if empty)
        data = sb.table("profiles").select("*").limit(1).execute()
        return {"ok": True, "rows": len(data.data), "sample": data.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
