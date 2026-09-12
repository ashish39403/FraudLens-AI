import json

from langchain_openai import ChatOpenAI

from app.ai.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.ai.schemas import AIInvestigationContext, AIInvestigationResult, RiskSignal
from app.core.config import settings


def generate_investigation_result(
    context: AIInvestigationContext,
    risk_signals: list[RiskSignal]) -> AIInvestigationResult:
    
    if settings.openai_api_key is None:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    if settings.openai_base_url is None:
        raise RuntimeError("OPENAI_BASE_URL is not configured")

    llm = ChatOpenAI(
        model=settings.ai_model,
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0.1,
    )

    structured_llm = llm.with_structured_output(AIInvestigationResult)

    user_prompt = USER_PROMPT_TEMPLATE.format(
        context=json.dumps(context.model_dump(), indent=2),
        risk_signals=json.dumps(
            [signal.model_dump() for signal in risk_signals],
            indent=2,
        ),
    )

    result = structured_llm.invoke(
        [
            ("system", SYSTEM_PROMPT),
            ("user", user_prompt),
        ]
    )

    return result