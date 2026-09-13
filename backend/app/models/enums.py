from enum import Enum

class UserRole(str, Enum):
    ANALYST = "ANALYST"
    REVIEWER = "REVIEWER"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class CustomerType(str, Enum):
    INDIVIDUAL = "INDIVIDUAL"
    BUSINESS = "BUSINESS"

class KycStatus(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class TransactionDirection(str, Enum):
    INBOUND = "INBOUND"
    OUTBOUND = "OUTBOUND"

class TransactionType(str, Enum):
    TRANSFER = "TRANSFER"
    CARD = "CARD"
    CASH = "CASH"
    UPI = "UPI"
    WIRE = "WIRE"

class TransactionStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"
    


class AlertSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatus(str, Enum):
    OPEN = "OPEN"
    IN_REVIEW = "IN_REVIEW"
    CLOSED = "CLOSED"
    FALSE_POSITIVE = "FALSE_POSITIVE"