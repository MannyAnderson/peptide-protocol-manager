# app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load .env at startup (local dev). In production (Render), env comes from dashboard.
load_dotenv()

from app.api.v1 import api_router  # after load_dotenv to ensure env is ready

app = FastAPI(title="Peptide API", version="1.0.0")

# CORS: allow your Expo dev URL and local hosts
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
@app.get("/health")
def root_health():
    return {"ok": True, "service": "fastapi"}

app.include_router(api_router, prefix="/api/v1")
