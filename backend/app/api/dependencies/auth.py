"""Authentication dependencies for FastAPI routes.

This file exposes small helper functions (dependencies) that FastAPI can run
before your endpoint handler. They validate the request and provide useful
values, like the authenticated ``user_id``.
"""
from fastapi import Header, HTTPException

from app.utils.supabase import get_supabase


async def require_user_id(authorization: str | None = Header(default=None)) -> str:
    """Validate a Supabase JWT and return the authenticated ``user_id``.

    - Expected header: ``Authorization: Bearer <token>``
    - On success: returns the user's UUID string
    - On failure: raises ``HTTPException`` with status 401
    """
    # 1) Ensure the Authorization header exists and looks like a Bearer token
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    # 2) Extract the token (the string after "Bearer ")
    token = authorization.split(" ", 1)[1]

    # 3) Get a Supabase client
    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        # 4) Ask Supabase to decode the JWT and return the user object
        res = supabase.auth.get_user(jwt=token)  # type: ignore[call-arg]
        user = getattr(res, "user", None)
        user_id = getattr(user, "id", None)
        # 5) Validate we received a user id
        if not user_id:
            raise ValueError("Missing user id")
        # 6) Return the user id as a string
        return str(user_id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


