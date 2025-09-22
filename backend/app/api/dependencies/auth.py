from fastapi import Header, HTTPException

from app.utils.supabase import get_supabase


async def require_user_id(authorization: str | None = Header(default=None)) -> str:
    """Validate Supabase JWT from Authorization header and return user_id.

    Expects header: Authorization: Bearer <token>
    Returns the authenticated user's ID on success. Raises 401 otherwise.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]

    supabase = get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        res = supabase.auth.get_user(jwt=token)  # type: ignore[call-arg]
        user = getattr(res, "user", None)
        user_id = getattr(user, "id", None)
        if not user_id:
            raise ValueError("Missing user id")
        return str(user_id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


