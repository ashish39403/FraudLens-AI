import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.api.deps import get_current_user
from app.db.session import engine
from app.main import app
from app.models.ai_report import AIInvestigation
from app.models.enums import UserRole
from app.models.user import User


client = TestClient(app)


def fake_current_user() -> User:
    return User(
        id=1,
        full_name="AI Report Test User",
        email="ai-report-test@example.com",
        hashed_password="test",
        role=UserRole.ANALYST,
    )


@pytest.fixture(autouse=True)
def override_current_user():
    app.dependency_overrides[get_current_user] = fake_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)


def create_ai_report() -> AIInvestigation:
    with Session(engine) as session:
        report = AIInvestigation(
            transaction_id=1,
            customer_id=1,
            risk_level="HIGH",
            risk_score=82,
            summary="High-value outbound wire transfer requires review.",
            suspicious_patterns=["High value transaction", "Outbound wire transfer"],
            evidence=["Amount exceeded threshold", "Transaction direction was outbound"],
            recommended_action="Escalate to compliance review.",
            confidence="HIGH",
            model_name="test-model",
            prompt_version="v1",
        )
        session.add(report)
        session.commit()
        session.refresh(report)
        session.expunge(report)
        return report


def test_list_ai_reports():
    create_ai_report()

    response = client.get("/api/v1/ai/investigations")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_ai_report():
    report = create_ai_report()

    response = client.get(
        f"/api/v1/ai/investigations/{report.id}",
    )

    assert response.status_code == 200
    assert response.json()["id"] == report.id


def test_download_ai_report_pdf():
    report = create_ai_report()

    response = client.get(
        f"/api/v1/ai/investigations/{report.id}/download",
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
