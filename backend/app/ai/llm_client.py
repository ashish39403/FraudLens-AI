import json

from langchain_openai import ChatOpenAI
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.ai.exceptions import AIProviderError
from app.ai.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.ai.schemas import AIInvestigationContext, AIInvestigationResult, RiskSignal
from app.ai.tracing import (
    mark_generation_error,
    mark_generation_success,
    trace_llm_generation,
)
from app.core.config import settings


def _build_structured_llm():
    if settings.openai_api_key is None:
        raise AIProviderError("OPENAI_API_KEY is not configured")
    if settings.openai_base_url is None:
        raise AIProviderError("OPENAI_BASE_URL is not configured")

    llm = ChatOpenAI(
        model=settings.ai_model,
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0.1,
        timeout=settings.ai_request_timeout_seconds,
        max_retries=0,
    )

    return llm.with_structured_output(AIInvestigationResult)


def _build_user_prompt(
    context: AIInvestigationContext,
    risk_signals: list[RiskSignal],
) -> str:
    return USER_PROMPT_TEMPLATE.format(
        context=json.dumps(context.model_dump(), indent=2),
        risk_signals=json.dumps(
            [signal.model_dump() for signal in risk_signals],
            indent=2,
        ),
    )


@retry(
    retry=retry_if_exception_type(AIProviderError),
    stop=stop_after_attempt(settings.ai_max_retries + 1),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    reraise=True,
)
def _invoke_structured_llm(user_prompt: str) -> AIInvestigationResult:
    input_payload = {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
    }

    try:
        with trace_llm_generation(input_payload):
            structured_llm = _build_structured_llm()
            result = structured_llm.invoke(
                [
                    ("system", SYSTEM_PROMPT),
                    ("user", user_prompt),
                ]
            )
            if isinstance(result, AIInvestigationResult):
                mark_generation_success(result.model_dump())
    except AIProviderError as exc:
        mark_generation_error(exc)
        raise
    except Exception as exc:
        mark_generation_error(exc)
        raise AIProviderError("AI provider request failed") from exc

    if not isinstance(result, AIInvestigationResult):
        raise AIProviderError("AI provider returned an invalid response")

    return result


def generate_investigation_result(
    context: AIInvestigationContext,
    risk_signals: list[RiskSignal],
) -> AIInvestigationResult:
    user_prompt = _build_user_prompt(context, risk_signals)

    return _invoke_structured_llm(user_prompt)
