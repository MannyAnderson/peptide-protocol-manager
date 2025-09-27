"""Labs endpoints for storing and summarizing lab panels.

- POST /labs: create lab record
- GET /labs: list user's labs (newest first)
- POST /labs/{id}/summarize: produce summary using OpenAI (or fallback) and store insight
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pydantic import BaseModel, Field

from app.api.dependencies.auth import require_user_id
from app.core.config import get_settings
from app.utils.supabase import get_supabase

try:
    from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover - optional
    OpenAI = None  # type: ignore


router = APIRouter(prefix="/labs", tags=["labs"])


class LabCreate(BaseModel):
    panel_name: str = Field(..., min_length=1)
    values: Dict[str, Any] = Field(default_factory=dict, description="Key-value lab metrics")
    notes: Optional[str] = None


class LabRow(BaseModel):
    id: Any
    user_id: str
    panel_name: str
    values: Dict[str, Any]
    notes: Optional[str] = None
    created_at: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED, response_model=LabRow)
async def create_lab(payload: LabCreate, user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    row = {
        "user_id": user_id,
        "panel_name": payload.panel_name,
        "values": payload.values,
        "notes": payload.notes,
    }
    res = supabase.table("labs").insert(row).select("*").execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Insert failed: {res.error}")
    data = (res.data or [None])[0]  # type: ignore[attr-defined]
    if not data:
        raise HTTPException(status_code=500, detail="Insert returned no data")
    return data


@router.get("", response_model=List[LabRow])
async def list_labs(user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("labs")
        .select("id,user_id,panel_name,values,notes,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    return rows


class SummarizeResponse(BaseModel):
    summary: str


@router.post("/{lab_id}/summarize", response_model=SummarizeResponse)
async def summarize_lab(lab_id: str = Path(...), user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # 1) Load the lab row
    res = (
        supabase.table("labs")
        .select("id,user_id,panel_name,values,notes,created_at")
        .eq("id", lab_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    rows: List[Dict[str, Any]] = res.data or []  # type: ignore[attr-defined]
    if not rows:
        raise HTTPException(status_code=404, detail="Lab not found")
    lab = rows[0]

    # 2) Build a concise prompt
    settings = get_settings()
    values = lab.get("values") or {}
    panel_name = lab.get("panel_name")
    created_at = lab.get("created_at")

    prompt = (
        "Summarize this lab panel concisely (3-5 bullet points max). "
        "Focus on notable highs/lows and simple next steps.\n"
        f"Panel: {panel_name}\n"
        f"Date: {created_at}\n"
        f"Values: {values}\n"
        "Return plain text."
    )

    if settings.OPENAI_API_KEY and OpenAI is not None:
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You return brief, plain text."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=250,
            )
            summary = completion.choices[0].message.content or ""
        except Exception as exc:  # noqa: BLE001
            summary = f"Could not generate AI summary: {exc}"
    else:
        # Fallback simple rules
        if not values:
            summary = "No values provided."
        else:
            # Pick top 3 keys alphabetically and report their values
            keys = sorted(values.keys())[:3]
            kv = ", ".join(f"{k}: {values[k]}" for k in keys)
            summary = f"Panel {panel_name}: {kv}. Consider discussing trends with your provider."

    # 3) Store an insight row linked to this lab
    ins_row = {
        "user_id": user_id,
        "source_type": "lab",
        "source_id": lab_id,
        "content": summary,
    }
    ins_res = supabase.table("insights").insert(ins_row).execute()
    # Non-fatal on insert error

    return {"summary": summary}


