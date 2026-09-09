from fastapi.testclient import TestClient

from app.main import app
from uuid import uuid4

client = TestClient(app)


def test_create_customer():
    external_customer_id = f"CUST-{uuid4()}"

    response = client.post(
        "/api/v1/customers",
        json={
            "external_customer_id": external_customer_id,
            "full_name": "Synthetic Customer One",
            "customer_type": "INDIVIDUAL",
            "country": "IN",
            "kyc_status": "VERIFIED",
            "risk_level": "LOW",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["external_customer_id"] == external_customer_id
    assert data["full_name"] == "Synthetic Customer One"


def test_list_customers():
    response = client.get("/api/v1/customers")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_customer_not_found():
    response = client.get("/api/v1/customers/999999")

    assert response.status_code == 404