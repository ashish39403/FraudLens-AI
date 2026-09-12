from app.ai.schemas import AIInvestigationContext, RiskSignal


HIGH_VALUE_THRESHOLD = 100_000
RELATED_TRANSACTION_THRESHOLD = 5


def extract_risk_signals(context: AIInvestigationContext) -> list[RiskSignal]:
    signals: list[RiskSignal] = []

    if context.transaction_amount >= HIGH_VALUE_THRESHOLD:
        signals.append(
            RiskSignal(
                name="High value transaction",
                severity="HIGH",
                description=(
                    f"Transaction amount {context.transaction_amount} is above "
                    f"the {HIGH_VALUE_THRESHOLD} threshold."
                ),
            )
        )

    if context.customer_risk_level == "HIGH":
        signals.append(
            RiskSignal(
                name="High risk customer",
                severity="HIGH",
                description="Customer is already classified as high risk.",
            )
        )

    if context.transaction_type == "WIRE" and context.transaction_direction == "OUTBOUND":
        signals.append(
            RiskSignal(
                name="Outbound wire transfer",
                severity="MEDIUM",
                description="Outbound wire transfers require additional review.",
            )
        )

    if context.related_transactions_count >= RELATED_TRANSACTION_THRESHOLD:
        signals.append(
            RiskSignal(
                name="Multiple related transactions",
                severity="MEDIUM",
                description=(
                    f"Customer has {context.related_transactions_count} related transactions."
                ),
            )
        )

    if not signals:
        signals.append(
            RiskSignal(
                name="No major deterministic signal",
                severity="LOW",
                description="No high-risk rule was triggered by the current context.",
            )
        )

    return signals