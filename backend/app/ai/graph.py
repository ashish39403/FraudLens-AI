from typing import TypedDict

from langgraph.graph import END, StateGraph
from sqlmodel import Session

from app.ai.context_builder import build_investigation_context
from app.ai.llm_client import generate_investigation_result
from app.ai.risk_features import extract_risk_signals
from app.ai.schemas import AIInvestigationContext, AIInvestigationResult, RiskSignal


class InvestigationState(TypedDict, total=False):
    session: Session
    transaction_id: int
    context: AIInvestigationContext
    risk_signals: list[RiskSignal]
    result: AIInvestigationResult


def build_context_node(state: InvestigationState) -> InvestigationState:
    context = build_investigation_context(
        session=state["session"],
        transaction_id=state["transaction_id"],
    )

    return {"context": context}


def extract_risk_signals_node(state: InvestigationState) -> InvestigationState:
    risk_signals = extract_risk_signals(state["context"])

    return {"risk_signals": risk_signals}


def generate_report_node(state: InvestigationState) -> InvestigationState:
    result = generate_investigation_result(
        context=state["context"],
        risk_signals=state["risk_signals"],
    )

    return {"result": result}


def create_investigation_graph():
    graph = StateGraph(InvestigationState)

    graph.add_node("build_context", build_context_node)
    graph.add_node("extract_risk_signals", extract_risk_signals_node)
    graph.add_node("generate_report", generate_report_node)

    graph.set_entry_point("build_context")

    graph.add_edge("build_context", "extract_risk_signals")
    graph.add_edge("extract_risk_signals", "generate_report")
    graph.add_edge("generate_report", END)

    return graph.compile()


investigation_graph = create_investigation_graph()
