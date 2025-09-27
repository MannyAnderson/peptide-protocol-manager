"""Peptides CRUD endpoints scoped to authenticated user.

- GET /peptides: list user's peptides
- POST /peptides: create peptide for user
- PATCH /peptides/{id}: partial update
- DELETE /peptides/{id}

All operations derive ``user_id`` via ``require_user_id`` and rely on Supabase
RLS to enforce row-level access. We still filter by ``user_id`` for safety.
"""
from __future__ import annotations

from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pydantic import BaseModel, Field

from app.api.dependencies.auth import require_user_id
from app.utils.supabase import get_supabase


router = APIRouter(prefix="/peptides", tags=["peptides"])


class PeptideBase(BaseModel):
    name: str = Field(..., min_length=1)
    units_remaining: Optional[float] = None
    expires_on: Optional[date] = None


class PeptideCreate(PeptideBase):
    pass


class PeptideUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    units_remaining: Optional[float] = None
    expires_on: Optional[date] = None


class PeptideRow(BaseModel):
    id: Any
    user_id: str
    name: str
    units_remaining: Optional[float] = None
    expires_on: Optional[date] = None
    created_at: Optional[str] = None


@router.get("", response_model=List[PeptideRow])
async def list_peptides(user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("peptides")
        .select("id,user_id,name,units_remaining,expires_on,created_at")
        .eq("user_id", user_id)
        .order("name", desc=False)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    return rows


@router.post("", status_code=status.HTTP_201_CREATED, response_model=PeptideRow)
async def create_peptide(payload: PeptideCreate, user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    row = {
        "user_id": user_id,
        "name": payload.name,
        "units_remaining": payload.units_remaining,
        "expires_on": payload.expires_on.isoformat() if payload.expires_on else None,
    }
    res = supabase.table("peptides").insert(row).select("*").execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Insert failed: {res.error}")
    data = (res.data or [None])[0]  # type: ignore[attr-defined]
    if not data:
        raise HTTPException(status_code=500, detail="Insert returned no data")
    return data


@router.patch("/{peptide_id}", response_model=PeptideRow)
async def update_peptide(
    peptide_id: str = Path(..., description="Peptide id"),
    payload: PeptideUpdate = ...,
    user_id: str = Depends(require_user_id),
):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    updates: dict = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.units_remaining is not None:
        updates["units_remaining"] = payload.units_remaining
    if payload.expires_on is not None:
        updates["expires_on"] = payload.expires_on.isoformat()

    if not updates:
        # Nothing to update; return current row if exists
        res0 = (
            supabase.table("peptides")
            .select("*")
            .eq("id", peptide_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        if getattr(res0, "error", None):
            raise HTTPException(status_code=500, detail=f"Query failed: {res0.error}")
        rows0: List[dict] = res0.data or []  # type: ignore[attr-defined]
        if not rows0:
            raise HTTPException(status_code=404, detail="Peptide not found")
        return rows0[0]

    res = (
        supabase.table("peptides")
        .update(updates)
        .eq("id", peptide_id)
        .eq("user_id", user_id)
        .select("*")
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Update failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    if not rows:
        raise HTTPException(status_code=404, detail="Peptide not found")
    return rows[0]


@router.delete("/{peptide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_peptide(peptide_id: str = Path(...), user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("peptides").delete().eq("id", peptide_id).eq("user_id", user_id).execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Delete failed: {res.error}")
    return None


