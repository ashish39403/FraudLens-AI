from app.ai.risk_features import extract_risk_signals
from app.ai.schemas import AIInvestigationContext


def test_extract_risk_signals_for_high_risk_wire_transaction():
    context = AIInvestigationContext(
        transaction_id=1,
        customer_id=9,
        customer_risk_level="HIGH",
        transaction_amount=250000,
        transaction_type="WIRE",
        transaction_direction="OUTBOUND",
        transaction_country="IN",
        related_transactions_count=6,
    )

    signals = extract_risk_signals(context)

    signal_names = [signal.name for signal in signals]

    assert "High value transaction" in signal_names
    assert "High risk customer" in signal_names
    assert "Outbound wire transfer" in signal_names
    assert "Multiple related transactions" in signal_names


def test_extract_risk_signals_for_low_risk_transaction():
    context = AIInvestigationContext(
        transaction_id=1,
        customer_id=9,
        customer_risk_level="LOW",
        transaction_amount=5000,
        transaction_type="UPI",
        transaction_direction="INBOUND",
        transaction_country="IN",
        related_transactions_count=1,
    )

    signals = extract_risk_signals(context)

    assert len(signals) == 1
    assert signals[0].name == "No major deterministic signal"
    assert signals[0].severity == "LOW"