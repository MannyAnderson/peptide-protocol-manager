"""Cycles endpoints for grouping schedules or protocol phases.

- POST /cycles: create cycle
- GET /cycles: list user's cycles
- PATCH /cycles/{id}: update selected fields (status/dates/name/notes)
- DELETE /cycles/{id}

Assumes a ``cycles`` table with RLS: id, user_id, name, status, start_date, end_date, notes, created_at.
"""
from __future__ import annotations

from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pydantic import BaseModel, Field

from app.api.dependencies.auth import require_user_id
from app.utils.supabase import get_supabase


router = APIRouter(prefix="/cycles", tags=["cycles"])


class CycleBase(BaseModel):
    name: str = Field(..., min_length=1)
    status: Optional[str] = Field(default="planned", description="planned|active|paused|completed")
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class CycleCreate(CycleBase):
    pass


class CycleUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class CycleRow(BaseModel):
    id: Any
    user_id: str
    name: str
    status: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CycleRow)
async def create_cycle(payload: CycleCreate, user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    row = {
        "user_id": user_id,
        "name": payload.name,
        "status": payload.status or "planned",
        "start_date": payload.start_date.isoformat() if payload.start_date else None,
        "end_date": payload.end_date.isoformat() if payload.end_date else None,
        "notes": payload.notes,
    }
    res = supabase.table("cycles").insert(row).select("*").execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Insert failed: {res.error}")
    data = (res.data or [None])[0]  # type: ignore[attr-defined]
    if not data:
        raise HTTPException(status_code=500, detail="Insert returned no data")
    return data


@router.get("", response_model=List[CycleRow])
async def list_cycles(user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("cycles")
        .select("id,user_id,name,status,start_date,end_date,notes,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    return rows


@router.patch("/{cycle_id}", response_model=CycleRow)
async def update_cycle(
    cycle_id: str = Path(..., description="Cycle id"),
    payload: CycleUpdate = ...,
    user_id: str = Depends(require_user_id),
):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    updates: dict = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.status is not None:
        updates["status"] = payload.status
    if payload.start_date is not None:
        updates["start_date"] = payload.start_date.isoformat()
    if payload.end_date is not None:
        updates["end_date"] = payload.end_date.isoformat()
    if payload.notes is not None:
        updates["notes"] = payload.notes

    if not updates:
        res0 = (
            supabase.table("cycles").select("*").eq("id", cycle_id).eq("user_id", user_id).limit(1).execute()
        )
        if getattr(res0, "error", None):
            raise HTTPException(status_code=500, detail=f"Query failed: {res0.error}")
        rows0: List[dict] = res0.data or []  # type: ignore[attr-defined]
        if not rows0:
            raise HTTPException(status_code=404, detail="Cycle not found")
        return rows0[0]

    res = (
        supabase.table("cycles")
        .update(updates)
        .eq("id", cycle_id)
        .eq("user_id", user_id)
        .select("*")
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Update failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    if not rows:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return rows[0]


@router.delete("/{cycle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cycle(cycle_id: str = Path(...), user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = supabase.table("cycles").delete().eq("id", cycle_id).eq("user_id", user_id).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Delete failed: {res.error}")
    return None


