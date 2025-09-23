"""Insights endpoints powered by recent tracking data and optional OpenAI.

The ``/insights/generate`` endpoint summarizes the last 7 days of user
tracking data and optionally asks OpenAI to produce short, actionable tips.
If ``OPENAI_API_KEY`` is not set, we return a few helpful default tips.
"""
from datetime import datetime, timedelta
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Header
from app.api.dependencies.auth import require_user_id

from app.core.config import get_settings
from app.utils.supabase import get_supabase

try:
    # OpenAI >= 1.x client name is 'openai'
    from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover - optional import
    OpenAI = None  # type: ignore


router = APIRouter(prefix="/insights", tags=["insights"])


async def get_user_id(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    # Ask Supabase to decode the JWT and give us the user record
    try:
        # supabase._auth is the auth client; use get_user(token) if present
        user = supabase.auth.get_user(token).user  # type: ignore[attr-defined]
        if not user or not getattr(user, "id", None):
            raise ValueError("No user")
        return str(user.id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/generate")
async def generate_insights(user_id: str = Depends(require_user_id)) -> Dict[str, Any]:
    # 1) Read config and get a Supabase client
    settings = get_settings()
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # 2) Define the time window (last 7 days) and fetch tracking rows
    since = (datetime.utcnow() - timedelta(days=7)).isoformat()
    # Fetch last 7 days of daily_tracking for this user
    res = supabase.table("daily_tracking").select(
        "created_at, weight_lbs, waist_in, bp_am, bp_pm, body_fat_pct, muscle_mass_pct, resting_hr_bpm, energy, appetite, performance"
    ).gte("created_at", since).eq("user_id", user_id).order("created_at", desc=True).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Failed to read tracking: {res.error}")
    rows: List[Dict[str, Any]] = res.data or []  # type: ignore[attr-defined]

    # 3) Summarize metrics into simple averages for the prompt
    def avg(key: str) -> float | None:
        vals = [r[key] for r in rows if r.get(key) is not None]
        if not vals:
            return None
        try:
            return float(sum(vals) / len(vals))
        except Exception:
            return None

    summary = {
        "entries": len(rows),
        "avg_weight_lbs": avg("weight_lbs"),
        "avg_waist_in": avg("waist_in"),
        "avg_resting_hr": avg("resting_hr_bpm"),
        "avg_energy": avg("energy"),
        "avg_appetite": avg("appetite"),
        "avg_performance": avg("performance"),
    }

    # 4) Build prompt for the AI model (kept short and specific)
    prompt = (
        "You are a health coach. Based on the user's last 7 days of metrics, provide 3-5 concise, actionable tips.\n"
        f"Summary: {summary}\n"
        "Constraints: return JSON with 'tips': an array of strings, short and specific."
    )

    # 5) If OpenAI is not configured, provide helpful defaults; else call API
    if not settings.OPENAI_API_KEY or OpenAI is None:
        # Fallback: mock insights
        tips = [
            "Great consistency this week. Consider a light refeed if energy averages below 6.",
            "Waist trend stable; add 10–15 min post-meal walks to nudge fat loss.",
            "Keep hydration high; a slight uptick in resting HR suggests more recovery.",
        ]
    else:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        try:
            # Ask the model for JSON-only output using the summary
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You return only JSON."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
            content = completion.choices[0].message.content or "{}"
            import json

            parsed = json.loads(content)
            tips = parsed.get("tips") or parsed.get("suggestions") or []
            if not isinstance(tips, list):
                tips = [str(tips)]
        except Exception as exc:  # noqa: BLE001
            tips = [f"Insight generation failed: {exc}"]

    # 6) Best effort: store the result so it can be viewed later
    insert_row = {"user_id": user_id, "summary": summary, "tips": tips}
    ins = supabase.table("insights").insert(insert_row).execute()
    if getattr(ins, "error", None):
        # Non-fatal: still return tips
        pass

    # 7) Return computed tips and summary
    return {"tips": tips, "summary": summary}


