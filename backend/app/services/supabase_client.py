"""Service helper for creating a Supabase client.

Most routes use ``app.utils.supabase.get_supabase`` which enforces presence of
environment variables. This helper is a softer version that returns ``None``
if configuration is missing, which can be useful during health checks.
"""
from functools import lru_cache
from typing import Optional

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase_client() -> Optional[Client]:
    """Create (and cache) a Supabase client if configuration is available.

    Returns ``None`` when required env variables are not set.
    """
    # 1) Load app settings (reads from env)
    settings = get_settings()
    # 2) Ensure we have URL + at least one key (service role preferred)
    if not settings.SUPABASE_URL or not (settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY):
        return None
    # 3) Prefer service role key on backend, otherwise use anon key
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    # 4) Create and return the client
    return create_client(settings.SUPABASE_URL, key)


