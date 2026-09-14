from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache
from typing import Any

from langfuse import Langfuse

from app.core.config import settings


def is_langfuse_enabled() -> bool:
    return bool(settings.langfuse_public_key and settings.langfuse_secret_key)


@lru_cache(maxsize=1)
def get_langfuse_client() -> Langfuse | None:
    if not is_langfuse_enabled():
        return None

    return Langfuse(
        public_key=settings.langfuse_public_key,
        secret_key=settings.langfuse_secret_key,
        host=settings.langfuse_base_url or settings.langfuse_host,
        environment=settings.environment,
    )


@contextmanager
def trace_ai_investigation(
    transaction_id: int,
    user_id: int | None,
) -> Iterator[Langfuse | None]:
    client = get_langfuse_client()
    if client is None:
        yield None
        return

    try:
        observation = client.start_as_current_observation(
            name="ai_investigation",
            as_type="chain",
            input={"transaction_id": transaction_id},
            metadata={
                "transaction_id": transaction_id,
                "user_id": user_id,
                "model": settings.ai_model,
            },
        )
    except Exception:
        yield None
        return

    with observation:
        yield client


@contextmanager
def trace_llm_generation(
    input_payload: dict[str, Any],
) -> Iterator[Langfuse | None]:
    client = get_langfuse_client()
    if client is None:
        yield None
        return

    try:
        observation = client.start_as_current_observation(
            name="generate_investigation_report",
            as_type="generation",
            input=input_payload,
            model=settings.ai_model,
            model_parameters={
                "temperature": 0,
                "timeout_seconds": settings.ai_request_timeout_seconds,
            },
        )
    except Exception:
        yield None
        return

    with observation:
        yield client


def mark_ai_trace_success(
    *,
    report_id: int,
    transaction_id: int,
    customer_id: int,
    risk_level: str,
    risk_score: int,
    confidence: str,
    prompt_version: str,
) -> None:
    client = get_langfuse_client()
    if client is None:
        return

    try:
        client.update_current_span(
            output={
                "report_id": report_id,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "confidence": confidence,
            },
            metadata={
                "transaction_id": transaction_id,
                "customer_id": customer_id,
                "prompt_version": prompt_version,
                "status": "success",
            },
            level="DEFAULT",
        )
        client.score_current_trace(
            name="risk_score",
            value=float(risk_score),
            data_type="NUMERIC",
            comment=f"Generated risk level: {risk_level}",
        )
        client.flush()
    except Exception:
        return


def mark_ai_trace_error(error: Exception) -> None:
    client = get_langfuse_client()
    if client is None:
        return

    try:
        client.update_current_span(
            level="ERROR",
            status_message=str(error),
            metadata={"status": "error", "error_type": error.__class__.__name__},
        )
        client.flush()
    except Exception:
        return


def mark_generation_success(output: dict[str, Any]) -> None:
    client = get_langfuse_client()
    if client is None:
        return

    try:
        client.update_current_generation(output=output, level="DEFAULT")
    except Exception:
        return


def mark_generation_error(error: Exception) -> None:
    client = get_langfuse_client()
    if client is None:
        return

    try:
        client.update_current_generation(
            level="ERROR",
            status_message=str(error),
            metadata={"error_type": error.__class__.__name__},
        )
    except Exception:
        return
