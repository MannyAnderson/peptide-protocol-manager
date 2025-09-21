# app/utils/supabase.py
import os
from functools import lru_cache
from supabase import create_client, Client

# These come from /backend/.env (for local dev) or your Render env vars (in prod)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL env var is missing.")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY env var is missing. (Use SERVICE ROLE on backend.)")

@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Create and cache a Supabase client (singleton)."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
