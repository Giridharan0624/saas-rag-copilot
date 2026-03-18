from fastapi import APIRouter, HTTPException, status, Depends
from auth.models import (
    UserCreate,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
    MessageResponse,
)
from auth.utils import hash_password, verify_password
from auth.jwt import create_access_token, create_refresh_token, verify_token
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ---------------------------------------------------------------------------
# In-memory user store (swap for a real DB later)
# Structure: { "username": "hashed_password" }
# ---------------------------------------------------------------------------
users_db: dict[str, str] = {}


# ── Signup ─────────────────────────────────────────────────────────────────
@router.post(
    "/signup",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def signup(user: UserCreate):
    if user.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    users_db[user.username] = hash_password(user.password)
    return MessageResponse(message=f"User '{user.username}' created successfully")


# ── Login ──────────────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive access + refresh tokens",
)
def login(user: UserLogin):
    stored_hash = users_db.get(user.username)

    if stored_hash is None or not verify_password(user.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token({"sub": user.username})
    refresh_token = create_refresh_token({"sub": user.username})

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


# ── Refresh ────────────────────────────────────────────────────────────────
@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new access + refresh token pair",
)
def refresh(body: RefreshTokenRequest):
    payload = verify_token(body.refresh_token, expected_type="refresh")

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    username = payload.get("sub")
    if username is None or username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    new_access = create_access_token({"sub": username})
    new_refresh = create_refresh_token({"sub": username})

    return TokenResponse(access_token=new_access, refresh_token=new_refresh)


# ── Me (Protected) ────────────────────────────────────────────────────────
@router.get(
    "/me",
    summary="Get the current authenticated user",
)
def get_me(current_user: str = Depends(get_current_user)):
    return {"username": current_user}
