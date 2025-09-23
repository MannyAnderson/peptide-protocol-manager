"""FastAPI application entrypoint.

This file creates the FastAPI app, configures CORS (what frontends are allowed
to call this API), exposes a simple ``/health`` endpoint, and mounts the
versioned API under ``/api/v1``.

If you're new:
- "CORS" is a browser security rule. Listing allowed origins prevents blocked
  requests when your mobile/web app talks to this API during development.
- "Router" is how we group endpoints. We include all v1 routes below.
"""
# app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env at startup (local dev). In production (Render), env comes from dashboard.
load_dotenv()

from app.api.v1 import api_router  # after load_dotenv to ensure env is ready

app = FastAPI(title="Peptide API", version="1.0.0")

# CORS: allow your Expo dev URL and local hosts so the app can call this API
ALLOWED_ORIGINS = [
    "http://localhost:19006",  # Expo web preview (if you use it)
    "http://localhost:5173",
    "http://127.0.0.1:19006",
    "*"  # you can tighten later; * is easiest for initial dev
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose /health at the root AND under /api/v1 if you want both:
# Small built-in health endpoint at the root for quick checks
@app.get("/health")
def root_health():
    # 1) If this handler runs, the app is alive
    # 2) Return a tiny JSON payload used by uptime checks
    return {"ok": True, "service": "fastapi"}

# Mount all versioned routes at /api/v1 (see app/api/v1)
app.include_router(api_router, prefix="/api/v1")
