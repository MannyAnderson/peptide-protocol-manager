from datetime import datetime, timedelta
from io import StringIO
import csv
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from app.api.dependencies.auth import require_user_id
from fastapi.responses import StreamingResponse

from app.utils.supabase import get_supabase


router = APIRouter(prefix="/export", tags=["export"])


async def resolve_user_id(
    authorization: Optional[str] = Header(default=None), token: Optional[str] = Query(default=None)
) -> str:
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    bearer = None
    if token:
        bearer = token
    elif authorization and authorization.lower().startswith("bearer "):
        bearer = authorization.split(" ", 1)[1]

    if not bearer:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        user = supabase.auth.get_user(bearer).user  # type: ignore[attr-defined]
        if not user or not getattr(user, "id", None):
            raise ValueError("No user")
        return str(user.id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/csv")
async def export_csv(
    user_id: str = Depends(require_user_id),
    start: Optional[str] = Query(default=None, description="ISO date or datetime"),
    end: Optional[str] = Query(default=None, description="ISO date or datetime"),
):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Parse date range (default last 30d)
    try:
        if start:
            start_dt = datetime.fromisoformat(start)
        else:
            start_dt = datetime.utcnow() - timedelta(days=30)
        if end:
            end_dt = datetime.fromisoformat(end)
        else:
            end_dt = datetime.utcnow()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid start/end format. Use ISO 8601.")

    # Query daily_tracking rows
    res = (
        supabase.table("daily_tracking")
        .select(
            "created_at, weight_lbs, waist_in, bp_am, bp_pm, body_fat_pct, muscle_mass_pct, resting_hr_bpm, energy, appetite, performance, peptide1_id, peptide2_id, peptide3_id"
        )
        .gte("created_at", start_dt.isoformat())
        .lte("created_at", end_dt.isoformat())
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Failed to read tracking: {res.error}")
    rows: List[Dict[str, Any]] = res.data or []  # type: ignore[attr-defined]

    # Prepare CSV
    headers = [
        "created_at",
        "weight_lbs",
        "waist_in",
        "bp_am",
        "bp_pm",
        "body_fat_pct",
        "muscle_mass_pct",
        "resting_hr_bpm",
        "energy",
        "appetite",
        "performance",
        "peptide1_id",
        "peptide2_id",
        "peptide3_id",
    ]
    buf = StringIO()
    writer = csv.DictWriter(buf, fieldnames=headers)
    writer.writeheader()
    for r in rows:
        writer.writerow({k: r.get(k, "") for k in headers})

    filename = f"daily_tracking_{start_dt.strftime('%Y%m%d')}_{end_dt.strftime('%Y%m%d')}.csv"
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


