from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.api.deps import CurrentUserDep
from app.core.security import create_access_token
from app.db.session import get_session
from app.schemas.auth import Token, UserCreate, UserLogin, UserRead
from app.services.user_service import authenticate_user, create_user


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user_endpoint(payload: UserCreate, session: SessionDep):
    user = create_user(session, payload)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    return user


@router.post("/login", response_model=Token)
def login_user_endpoint(payload: UserLogin, session: SessionDep):
    user = authenticate_user(session, payload.email, payload.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(access_token=access_token)


@router.post("/token", response_model=Token)
def token_endpoint(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
):
    user = authenticate_user(session, form_data.username, form_data.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(access_token=access_token)


@router.get("/me", response_model=UserRead)
def get_current_user_endpoint(current_user: CurrentUserDep):
    return current_user
