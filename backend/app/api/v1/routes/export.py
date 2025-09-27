"""Data export endpoints.

Exports the user's daily tracking data to CSV over a date range. The client
must authenticate, and we pull only rows for that user.
"""
from datetime import datetime, timedelta
from io import StringIO, BytesIO
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
    """Resolve a user id from either the Authorization header or ``?token=``.

    We support ``?token=`` for convenience on mobile's "open URL" flows where
    adding custom headers can be tricky.
    """
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
    # 1) Get Supabase client
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # 2) Parse date range (default last 30 days)
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

    # 3) Query user's daily_tracking rows within the date window
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

    # 4) Prepare CSV from the rows
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

    # 5) Name the file using the date window
    filename = f"daily_tracking_{start_dt.strftime('%Y%m%d')}_{end_dt.strftime('%Y%m%d')}.csv"
    buf.seek(0)
    # 6) Stream the CSV back to the client as a file download
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )



@router.get("/pdf")
async def export_pdf(
    user_id: str = Depends(require_user_id),
    start: Optional[str] = Query(default=None, description="ISO date or datetime"),
    end: Optional[str] = Query(default=None, description="ISO date or datetime"),
):
    # 1) Get Supabase client
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    # 2) Parse date range (default last 30 days)
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

    # 3) Query user's daily_tracking rows within the date window
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

    # 4) Build a simple PDF table using reportlab
    try:
        from reportlab.lib.pagesizes import letter  # type: ignore
        from reportlab.pdfgen import canvas  # type: ignore
    except Exception:
        raise HTTPException(status_code=500, detail="PDF generator not installed. Add 'reportlab'.")

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter

    title = f"Daily Tracking {start_dt.strftime('%Y-%m-%d')} to {end_dt.strftime('%Y-%m-%d')}"
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, height - 40, title)

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

    c.setFont("Helvetica-Bold", 9)
    y = height - 70
    x_positions = [40, 110, 170, 220, 270, 320, 380, 450, 510]  # coarse columns

    # Draw header (wrap into two rows to fit)
    header_line1 = ["created_at", "weight", "waist", "bp_am", "bp_pm", "bf%", "mm%", "rest_hr", "energy"]
    header_line2 = ["appetite", "perf", "pep1", "pep2", "pep3"]
    for i, text in enumerate(header_line1):
        c.drawString(x_positions[i], y, text)
    y -= 14
    for i, text in enumerate(header_line2):
        c.drawString(x_positions[i], y, text)
    y -= 10
    c.line(40, y, width - 40, y)
    y -= 12

    c.setFont("Helvetica", 8)

    def draw_row(r: Dict[str, Any], yy: float) -> float:
        created = r.get("created_at", "")
        weight = r.get("weight_lbs", "")
        waist = r.get("waist_in", "")
        bpam = r.get("bp_am", "")
        bppm = r.get("bp_pm", "")
        bfp = r.get("body_fat_pct", "")
        mmp = r.get("muscle_mass_pct", "")
        rhr = r.get("resting_hr_bpm", "")
        eng = r.get("energy", "")
        app = r.get("appetite", "")
        perf = r.get("performance", "")
        p1 = r.get("peptide1_id", "")
        p2 = r.get("peptide2_id", "")
        p3 = r.get("peptide3_id", "")

        vals1 = [str(created)[:16], weight, waist, bpam, bppm, bfp, mmp, rhr, eng]
        vals2 = [app, perf, p1, p2, p3]
        for i, v in enumerate(vals1):
            c.drawString(x_positions[i], yy, str(v))
        yy -= 12
        for i, v in enumerate(vals2):
            c.drawString(x_positions[i], yy, str(v))
        yy -= 12
        c.line(40, yy, width - 40, yy)
        return yy - 8

    for r in rows:
        if y < 80:
            c.showPage()
            c.setFont("Helvetica-Bold", 14)
            c.drawString(40, height - 40, title)
            c.setFont("Helvetica-Bold", 9)
            y = height - 70
            for i, text in enumerate(header_line1):
                c.drawString(x_positions[i], y, text)
            y -= 14
            for i, text in enumerate(header_line2):
                c.drawString(x_positions[i], y, text)
            y -= 10
            c.line(40, y, width - 40, y)
            y -= 12
            c.setFont("Helvetica", 8)
        y = draw_row(r, y)

    c.showPage()
    c.save()
    buf.seek(0)

    filename = f"daily_tracking_{start_dt.strftime('%Y%m%d')}_{end_dt.strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

