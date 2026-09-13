from decimal import Decimal
from app.models.transaction import Transaction
from app.models.enums import AlertSeverity, TransactionType, TransactionDirection

# ---------- CONFIG THRESHOLDS ----------
HIGH_AMOUNT_THRESHOLD = Decimal("100000")       # ₹1,00,000 se upar = suspicious
VERY_HIGH_AMOUNT_THRESHOLD = Decimal("500000")  # ₹5,00,000 se upar = critical
ODD_HOUR_START = 0                              # raat 12 baje
ODD_HOUR_END = 5                                # subah 5 baje tak


def check_high_amount(transaction: Transaction) -> tuple[bool, str, AlertSeverity] | None:
    """Bahut zyada amount ka transaction"""
    if transaction.amount >= VERY_HIGH_AMOUNT_THRESHOLD:
        return True, "high_amount_transaction", AlertSeverity.CRITICAL
    elif transaction.amount >= HIGH_AMOUNT_THRESHOLD:
        return True, "high_amount_transaction", AlertSeverity.HIGH
    return None


def check_odd_hour_transaction(transaction: Transaction) -> tuple[bool, str, AlertSeverity] | None:
    """Raat ke odd hours mein transaction (occurred_at ke basis pe)"""
    hour = transaction.occurred_at.hour
    if ODD_HOUR_START <= hour <= ODD_HOUR_END:
        return True, "odd_hour_transaction", AlertSeverity.MEDIUM
    return None


def check_rapid_transactions(
    recent_transactions: list[Transaction],
    count_threshold: int = 5,
) -> tuple[bool, str, AlertSeverity] | None:
    """Thode time mein bahut saare transactions (velocity check)"""
    if len(recent_transactions) >= count_threshold:
        return True, "rapid_fire_transactions", AlertSeverity.HIGH
    return None


def check_large_cash_withdrawal(transaction: Transaction) -> tuple[bool, str, AlertSeverity] | None:
    """Bada cash outbound transaction - money laundering ka common pattern"""
    if (
        transaction.transaction_type == TransactionType.CASH
        and transaction.direction == TransactionDirection.OUTBOUND
        and transaction.amount >= HIGH_AMOUNT_THRESHOLD
    ):
        return True, "large_cash_withdrawal", AlertSeverity.HIGH
    return None


def check_failed_transaction_spike(recent_transactions: list[Transaction], failed_threshold: int = 3) -> tuple[bool, str, AlertSeverity] | None:
    """Bahut saare FAILED transactions ek saath - card testing/fraud attempt ka sign"""
    from app.models.enums import TransactionStatus

    failed_count = sum(1 for t in recent_transactions if t.status == TransactionStatus.FAILED)
    if failed_count >= failed_threshold:
        return True, "repeated_failed_transactions", AlertSeverity.MEDIUM
    return None


# ---------- MAIN ENGINE ----------

def evaluate_transaction(
    transaction: Transaction,
    recent_transactions: list[Transaction] | None = None,
) -> list[dict]:
    """
    Ek transaction ko saare rules se check karo.
    Return: list of triggered rules with details, jinse Alert banega.
    """
    triggered_rules = []

    rules_to_check = [
        check_high_amount(transaction),
        check_odd_hour_transaction(transaction),
        check_large_cash_withdrawal(transaction),
    ]

    if recent_transactions is not None:
        rules_to_check.append(check_rapid_transactions(recent_transactions))
        rules_to_check.append(check_failed_transaction_spike(recent_transactions))

    for result in rules_to_check:
        if result:
            is_triggered, rule_name, severity = result
            triggered_rules.append({
                "rule_name": rule_name,
                "severity": severity,
                "description": f"Rule '{rule_name}' triggered for transaction {transaction.id} (amount: {transaction.amount})",
            })

    return triggered_rules