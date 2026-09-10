from uuid import uuid4

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.db.session import engine
from app.main import app
from app.services.user_service import get_user_by_email


client = TestClient(app)


def unique_email() -> str:
    return f"auth-{uuid4()}@example.com"


def register_user(email: str, password: str = "Secret123"):
    return client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Auth Test User",
            "email": email,
            "password": password,
            "role": "ANALYST",
        },
    )


def login_user(email: str, password: str = "Secret123"):
    return client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )


def test_register_user_success():
    email = unique_email()

    response = register_user(email)

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert "hashed_password" not in data


def test_register_duplicate_email_fails():
    email = unique_email()

    first_response = register_user(email)
    second_response = register_user(email)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_register_weak_password_fails():
    response = register_user(unique_email(), password="weak")

    assert response.status_code == 422


def test_login_success_returns_access_token():
    email = unique_email()
    register_user(email)

    response = login_user(email)

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]


def test_login_wrong_password_fails():
    email = unique_email()
    register_user(email)

    response = login_user(email, password="Wrong123")

    assert response.status_code == 401


def test_me_without_token_fails():
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_me_with_token_returns_current_user():
    email = unique_email()
    register_user(email)
    login_response = login_user(email)
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == email


def test_inactive_user_cannot_login():
    email = unique_email()
    register_user(email)

    with Session(engine) as session:
        user = get_user_by_email(session, email)
        user.is_active = False
        session.add(user)
        session.commit()

    response = login_user(email)

    assert response.status_code == 401
