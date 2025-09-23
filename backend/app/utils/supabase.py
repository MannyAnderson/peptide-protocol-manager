"""Shared Supabase client factory.

This module creates a singleton Supabase client using environment variables.
On backend servers, we prefer using the SERVICE ROLE key because it can read
and write server-side (never expose this key to the frontend!).
"""
# app/utils/supabase.py
import os
from functools import lru_cache
from supabase import create_client, Client

# These come from /backend/.env (for local dev) or your Render env vars (in prod)
# 1) Read the Supabase project URL
SUPABASE_URL = os.getenv("SUPABASE_URL")
# 2) Read the SERVICE ROLE key (server-only secret)
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    # 3) Fail fast if URL is not set
    raise RuntimeError("SUPABASE_URL env var is missing.")
if not SUPABASE_SERVICE_ROLE_KEY:
    # 4) Fail fast if key is not set (critical for server access)
    raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY env var is missing. (Use SERVICE ROLE on backend.)")

@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Create and cache a Supabase client (singleton).

    The first call creates the client; later calls reuse it for performance.
    """
    # 5) Construct the client using URL + SERVICE ROLE key
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
