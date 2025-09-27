"""Scheduling endpoints for doses.

- POST /schedule: create a schedule
- GET /schedule/upcoming?days=7: compute upcoming dose items in the next N days
- PATCH /schedule/{id}/pause: set status=paused
- DELETE /schedule/{id}

Assumptions about ``schedules`` table columns (server-side RLS enforced):
  id (uuid PK), user_id (uuid), name (text), item_type (text), item_id (uuid | null),
  dose (text | null), frequency (text: 'daily'|'weekly'), weekday (int 0-6 | null),
  start_date (date), end_date (date | null), time_of_day (text 'HH:MM' | null),
  status (text: 'active'|'paused'|'ended'), created_at (timestamptz)
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel, Field

from app.api.dependencies.auth import require_user_id
from app.utils.supabase import get_supabase


router = APIRouter(tags=["schedule"])


class ScheduleBase(BaseModel):
    name: str = Field(..., min_length=1)
    item_type: Optional[str] = Field(default=None, description="peptide|supplement|custom")
    item_id: Optional[str] = None
    dose: Optional[str] = None
    frequency: str = Field(..., description="daily|weekly")
    weekday: Optional[int] = Field(default=None, ge=0, le=6, description="0=Mon .. 6=Sun")
    start_date: date
    end_date: Optional[date] = None
    time_of_day: Optional[str] = Field(default=None, description="HH:MM 24h")
    status: Optional[str] = Field(default="active")


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleRow(BaseModel):
    id: Any
    user_id: str
    name: str
    item_type: Optional[str] = None
    item_id: Optional[str] = None
    dose: Optional[str] = None
    frequency: str
    weekday: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    time_of_day: Optional[str] = None
    status: str
    created_at: Optional[str] = None


class UpcomingItem(BaseModel):
    schedule_id: Any
    name: str
    item_type: Optional[str] = None
    dose: Optional[str] = None
    date: date
    time_of_day: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ScheduleRow)
async def create_schedule(payload: ScheduleCreate, user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    row = {
        "user_id": user_id,
        "name": payload.name,
        "item_type": payload.item_type,
        "item_id": payload.item_id,
        "dose": payload.dose,
        "frequency": payload.frequency,
        "weekday": payload.weekday,
        "start_date": payload.start_date.isoformat(),
        "end_date": payload.end_date.isoformat() if payload.end_date else None,
        "time_of_day": payload.time_of_day,
        "status": payload.status or "active",
    }
    res = supabase.table("schedules").insert(row).select("*").execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Insert failed: {res.error}")
    data = (res.data or [None])[0]  # type: ignore[attr-defined]
    if not data:
        raise HTTPException(status_code=500, detail="Insert returned no data")
    return data


@router.get("/upcoming", response_model=List[UpcomingItem])
async def get_upcoming(
    user_id: str = Depends(require_user_id), days: int = Query(default=7, ge=1, le=60)
):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    today = datetime.utcnow().date()
    window_end = today + timedelta(days=days)

    res = (
        supabase.table("schedules")
        .select(
            "id,name,item_type,item_id,dose,frequency,weekday,start_date,end_date,time_of_day,status"
        )
        .eq("user_id", user_id)
        .eq("status", "active")
        .lte("start_date", window_end.isoformat())
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Query failed: {res.error}")
    schedules: List[Dict[str, Any]] = res.data or []  # type: ignore[attr-defined]

    def gen_daily(s: Dict[str, Any]) -> List[UpcomingItem]:
        start = max(today, date.fromisoformat(s["start_date"]))
        end = date.fromisoformat(s["end_date"]) if s.get("end_date") else window_end
        end = min(end, window_end)
        items: List[UpcomingItem] = []
        d = start
        while d <= end:
            items.append(
                UpcomingItem(
                    schedule_id=s["id"],
                    name=s["name"],
                    item_type=s.get("item_type"),
                    dose=s.get("dose"),
                    date=d,
                    time_of_day=s.get("time_of_day"),
                )
            )
            d = d + timedelta(days=1)
        return items

    def gen_weekly(s: Dict[str, Any]) -> List[UpcomingItem]:
        start = max(today, date.fromisoformat(s["start_date"]))
        end = date.fromisoformat(s["end_date"]) if s.get("end_date") else window_end
        end = min(end, window_end)
        wday = s.get("weekday")
        if wday is None:
            wday = date.fromisoformat(s["start_date"]).weekday()
        # advance to the next occurrence on/after start matching weekday
        delta = (wday - start.weekday()) % 7
        first = start + timedelta(days=delta)
        items: List[UpcomingItem] = []
        d = first
        while d <= end:
            items.append(
                UpcomingItem(
                    schedule_id=s["id"],
                    name=s["name"],
                    item_type=s.get("item_type"),
                    dose=s.get("dose"),
                    date=d,
                    time_of_day=s.get("time_of_day"),
                )
            )
            d = d + timedelta(days=7)
        return items

    upcoming: List[UpcomingItem] = []
    for s in schedules:
        freq = (s.get("frequency") or "").lower()
        if freq == "daily":
            upcoming.extend(gen_daily(s))
        elif freq == "weekly":
            upcoming.extend(gen_weekly(s))
        else:
            # Unsupported frequency types are ignored
            continue

    # Sort by date then time_of_day (None last)
    def sort_key(it: UpcomingItem):
        time_key = it.time_of_day or "99:99"
        return (it.date.isoformat(), time_key)

    upcoming.sort(key=sort_key)
    return upcoming


@router.patch("/{schedule_id}/pause", response_model=ScheduleRow)
async def pause_schedule(schedule_id: str = Path(...), user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("schedules")
        .update({"status": "paused"})
        .eq("id", schedule_id)
        .eq("user_id", user_id)
        .select("*")
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Update failed: {res.error}")
    rows: List[dict] = res.data or []  # type: ignore[attr-defined]
    if not rows:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return rows[0]


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(schedule_id: str = Path(...), user_id: str = Depends(require_user_id)):
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = (
        supabase.table("schedules").delete().eq("id", schedule_id).eq("user_id", user_id).execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Delete failed: {res.error}")
    return None


