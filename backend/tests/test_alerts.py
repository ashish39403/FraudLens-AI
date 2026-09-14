from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_customer(risk_level: str = "HIGH") -> int:
    response = client.post(
        "/api/v1/customers",
        json={
            "external_customer_id": f"CUST-{uuid4()}",
            "full_name": "Alert Test Customer",
            "customer_type": "INDIVIDUAL",
            "country": "IN",
            "kyc_status": "VERIFIED",
            "risk_level": risk_level,
        },
    )

    assert response.status_code == 201
    return response.json()["id"]


def create_transaction(customer_id: int, amount: float = 250000.0):
    return client.post(
        "/api/v1/transactions",
        json={
            "customer_id": customer_id,
            "counterparty_name": "Alert Counterparty",
            "counterparty_account": "ACCT-ALERT-001",
            "direction": "OUTBOUND",
            "amount": amount,
            "currency": "USD",
            "transaction_type": "WIRE",
            "status": "SUCCESS",
            "occurred_at": "2026-09-14T14:20:00",
        },
    )


def test_list_alerts_endpoint():
    response = client.get("/api/v1/alerts")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_high_amount_transaction_creates_alert():
    customer_id = create_customer()
    transaction_response = create_transaction(customer_id)

    assert transaction_response.status_code == 201
    transaction_id = transaction_response.json()["id"]

    alerts_response = client.get("/api/v1/alerts")

    assert alerts_response.status_code == 200
    alerts = alerts_response.json()

    matching_alerts = [
        alert
        for alert in alerts
        if alert["transaction_id"] == transaction_id
        and alert["rule_name"] == "high_amount_transaction"
    ]

    assert matching_alerts
    assert matching_alerts[0]["severity"] == "HIGH"


def test_create_outbound_wire_transaction_creates_wire_alert():
    customer_id = create_customer(risk_level="LOW")
    transaction_response = create_transaction(customer_id, amount=5000.0)

    assert transaction_response.status_code == 201
    transaction_id = transaction_response.json()["id"]

    alerts_response = client.get("/api/v1/alerts")

    assert alerts_response.status_code == 200
    alerts = alerts_response.json()

    matching_alerts = [
        alert
        for alert in alerts
        if alert["transaction_id"] == transaction_id
        and alert["rule_name"] == "outbound_wire_transfer"
    ]

    assert matching_alerts
    assert matching_alerts[0]["severity"] == "MEDIUM"
