from sqlmodel import Session, select

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import UserCreate


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: int) -> User | None:
    return session.get(User, user_id)


def create_user(session: Session, user_data: UserCreate) -> User | None:
    existing_user = get_user_by_email(session, user_data.email)

    if existing_user is not None:
        return None

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session, email)

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user
