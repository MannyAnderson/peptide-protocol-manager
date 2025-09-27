"""Supplements CRUD endpoints scoped to authenticated user.

- GET /supplements: list user's supplements
- POST /supplements: create supplement for user
- PATCH /supplements/{id}: partial update
- DELETE /supplements/{id}

Uses ``require_user_id`` to derive the auth user and Supabase client for DB ops.
"""
from __future__ import annotations

from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pydantic import BaseModel, Field

from app.api.dependencies.auth import require_user_id
from app.utils.supabase import get_supabase


router = APIRouter(prefix="/supplements", tags=["supplements"])


class SupplementBase(BaseModel):
    name: str = Field(..., min_length=1)
    dose: Optional[str] = None
    schedule: Optional[str] = None
    notes: Optional[str] = None


class SupplementCreate(SupplementBase):
    pass


class SupplementUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    dose: Optional[str] = None
    schedule: Optional[str] = None
    notes: Optional[str] = None


class SupplementRow(BaseModel):
    id: Any
    user_id: str
    name: str
    dose: Optional[str] = None
    schedule: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None


@router.get("", response_model=List[SupplementRow])
async def list_supplements(user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("supplements")
        .select("id,user_id,name,dose,schedule,notes,created_at")
        .eq("user_id", user_id)
        .order("name", desc=False)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    return rows


@router.post("", status_code=status.HTTP_201_CREATED, response_model=SupplementRow)
async def create_supplement(payload: SupplementCreate, user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    row = {
        "user_id": user_id,
        "name": payload.name,
        "dose": payload.dose,
        "schedule": payload.schedule,
        "notes": payload.notes,
    }
    res = supabase.table("supplements").insert(row).select("*").execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Insert failed: {res.error}")
    data = (res.data or [None])[0]  # type: ignore[attr-defined]
    if not data:
        raise HTTPException(status_code=500, detail="Insert returned no data")
    return data


@router.patch("/{supplement_id}", response_model=SupplementRow)
async def update_supplement(
    supplement_id: str = Path(..., description="Supplement id"),
    payload: SupplementUpdate = ...,
    user_id: str = Depends(require_user_id),
):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    updates: dict = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.dose is not None:
        updates["dose"] = payload.dose
    if payload.schedule is not None:
        updates["schedule"] = payload.schedule
    if payload.notes is not None:
        updates["notes"] = payload.notes

    if not updates:
        res0 = (
            supabase.table("supplements").select("*").eq("id", supplement_id).eq("user_id", user_id).limit(1).execute()
        )
        if getattr(res0, "error", None):
            raise HTTPException(status_code=500, detail=f"Query failed: {res0.error}")
        rows0: List[dict] = res0.data or []  # type: ignore[attr-defined]
        if not rows0:
            raise HTTPException(status_code=404, detail="Supplement not found")
        return rows0[0]

    res = (
        supabase.table("supplements")
        .update(updates)
        .eq("id", supplement_id)
        .eq("user_id", user_id)
        .select("*")
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Update failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    if not rows:
        raise HTTPException(status_code=404, detail="Supplement not found")
    return rows[0]


@router.delete("/{supplement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplement(supplement_id: str = Path(...), user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("supplements").delete().eq("id", supplement_id).eq("user_id", user_id).execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Delete failed: {res.error}")
    return None


