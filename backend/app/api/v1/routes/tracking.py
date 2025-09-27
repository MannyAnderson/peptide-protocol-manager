"""Daily tracking endpoints.

This router exposes CRUD-like endpoints for the ``daily_tracking`` table:
- POST /tracking: create a daily log for the authenticated user
- GET /tracking: list logs between an optional date range (defaults to 7 days)
- GET /tracking/latest: fetch the most recent entry for the user

All endpoints require authentication; the ``user_id`` is derived from the
``require_user_id`` dependency which validates the Bearer token via Supabase.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies.auth import require_user_id
from app.utils.supabase import get_supabase
from pydantic import BaseModel, Field


router = APIRouter(prefix="/tracking", tags=["tracking"])


class TrackingBase(BaseModel):
    """Fields the client may provide for a daily tracking entry.

    The frontend currently uses these fields. Optional peptide ids allow "None" selections.
    """

    date: Optional[str] = Field(
        default=None, description="ISO 8601 date or datetime; defaults to now if omitted"
    )
    peptide1_id: Optional[str] = None
    peptide2_id: Optional[str] = None
    peptide3_id: Optional[str] = None

    weight_lbs: Optional[float] = None
    waist_in: Optional[float] = None
    bp_am: Optional[str] = None
    bp_pm: Optional[str] = None

    body_fat_percent: Optional[float] = Field(default=None, alias="body_fat_pct")
    muscle_mass_percent: Optional[float] = Field(default=None, alias="muscle_mass_pct")
    resting_hr: Optional[float] = Field(default=None, alias="resting_hr_bpm")

    energy: Optional[int] = None
    appetite: Optional[int] = None
    performance: Optional[int] = None
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class TrackingCreateRequest(TrackingBase):
    pass


class TrackingRow(BaseModel):
    id: Any
    user_id: str
    created_at: str
    peptide1_id: Optional[str] = None
    peptide2_id: Optional[str] = None
    peptide3_id: Optional[str] = None
    weight_lbs: Optional[float] = None
    waist_in: Optional[float] = None
    bp_am: Optional[str] = None
    bp_pm: Optional[str] = None
    body_fat_pct: Optional[float] = None
    muscle_mass_pct: Optional[float] = None
    resting_hr_bpm: Optional[float] = None
    energy: Optional[int] = None
    appetite: Optional[int] = None
    performance: Optional[int] = None
    notes: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TrackingRow)
async def create_tracking(payload: TrackingCreateRequest, user_id: str = Depends(require_user_id)):
    """Create a daily tracking row for the authenticated user.

    - Derives ``user_id`` from auth
    - Coerces optional ``date`` to ISO timestamp for ``created_at`` when provided
    - Persists to Supabase table ``daily_tracking``
    """
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Parse date (if provided) and set created_at; otherwise backend default (now)
    created_at: Optional[str] = None
    if payload.date:
        try:
            created_at = datetime.fromisoformat(payload.date).isoformat()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO 8601.")

    # Map request model to DB column names
    row = {
        "user_id": user_id,
        "peptide1_id": payload.peptide1_id,
        "peptide2_id": payload.peptide2_id,
        "peptide3_id": payload.peptide3_id,
        "weight_lbs": payload.weight_lbs,
        "waist_in": payload.waist_in,
        "bp_am": payload.bp_am,
        "bp_pm": payload.bp_pm,
        "body_fat_pct": payload.body_fat_percent,
        "muscle_mass_pct": payload.muscle_mass_percent,
        "resting_hr_bpm": payload.resting_hr,
        "energy": payload.energy,
        "appetite": payload.appetite,
        "performance": payload.performance,
        "notes": payload.notes,
    }
    if created_at:
        row["created_at"] = created_at

    res = supabase.table("daily_tracking").insert(row).select("*").execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Insert failed: {res.error}")
    data = (res.data or [None])[0]  # type: ignore[attr-defined]
    if not data:
        raise HTTPException(status_code=500, detail="Insert returned no data")
    return data


@router.get("", response_model=List[TrackingRow])
async def list_tracking(
    user_id: str = Depends(require_user_id),
    start: Optional[str] = Query(default=None, description="ISO 8601 start (inclusive)"),
    end: Optional[str] = Query(default=None, description="ISO 8601 end (inclusive)"),
):
    """List tracking rows for the authenticated user within a date range.

    Defaults to the last 7 days if dates are not provided.
    """
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # Resolve date window
    try:
        start_dt = datetime.fromisoformat(start) if start else datetime.utcnow() - timedelta(days=7)
        end_dt = datetime.fromisoformat(end) if end else datetime.utcnow()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid start/end format. Use ISO 8601.")

    q = (
        supabase.table("daily_tracking")
        .select("*")
        .gte("created_at", start_dt.isoformat())
        .lte("created_at", end_dt.isoformat())
        .eq("user_id", user_id)
        .order("created_at", desc=False)
    )
    res = q.execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    return rows


@router.get("/latest", response_model=Optional[TrackingRow])
async def get_latest_tracking(user_id: str = Depends(require_user_id)):
    """Return the most recent tracking entry for the authenticated user."""
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    res = (
        supabase.table("daily_tracking")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    return rows[0] if rows else None


