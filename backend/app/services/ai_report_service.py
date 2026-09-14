from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlmodel import Session, select

from app.models.ai_report import AIInvestigation


def list_ai_reports(
    session: Session,
    transaction_id: int | None = None,
    customer_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[AIInvestigation]:
    query = select(AIInvestigation)

    if transaction_id:
        query = query.where(AIInvestigation.transaction_id == transaction_id)
    if customer_id:
        query = query.where(AIInvestigation.customer_id == customer_id)

    query = query.order_by(AIInvestigation.created_at.desc()).offset(skip).limit(limit)
    return list(session.exec(query).all())


def get_ai_report(session: Session, report_id: int) -> AIInvestigation | None:
    return session.get(AIInvestigation, report_id)


def build_ai_report_pdf(report: AIInvestigation) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        rightMargin=48,
        leftMargin=48,
        topMargin=48,
        bottomMargin=48,
    )
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("FraudLens AI Investigation Report", styles["Title"]))
    story.append(Spacer(1, 12))

    metadata = [
        ["Report ID", str(report.id)],
        ["Transaction ID", str(report.transaction_id)],
        ["Customer ID", str(report.customer_id)],
        ["Risk Level", report.risk_level],
        ["Risk Score", str(report.risk_score)],
        ["Confidence", report.confidence],
        ["Model", report.model_name],
        ["Prompt Version", report.prompt_version],
        ["Generated At", report.created_at.isoformat()],
    ]

    table = Table(metadata, colWidths=[140, 330])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8EEF7")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#111827")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Summary", styles["Heading2"]))
    story.append(Paragraph(report.summary, styles["BodyText"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Suspicious Patterns", styles["Heading2"]))
    for pattern in report.suspicious_patterns:
        story.append(Paragraph(f"- {pattern}", styles["BodyText"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Evidence", styles["Heading2"]))
    for item in report.evidence:
        story.append(Paragraph(f"- {item}", styles["BodyText"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Recommended Action", styles["Heading2"]))
    story.append(Paragraph(report.recommended_action, styles["BodyText"]))

    doc.build(story)
    return buffer.getvalue()
