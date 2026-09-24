from typing import Literal, Optional
from pydantic import BaseModel, Field


class IntentRequest(BaseModel):
    text: str


class IntentTarget(BaseModel):
    application: Optional[str] = None


class IntentResult(BaseModel):
    status: Literal["ok", "clarify"]

    mode: Optional[
        Literal["answer", "guide", "act", "delegate"]
    ] = None

    intent: Optional[
        Literal[
            "answer_question",
            "explain",
            "search_web",
            "open_application",
            "navigate_ui",
            "create_content",
            "edit_content",
        ]
    ] = None

    target: IntentTarget = Field(
        default_factory=IntentTarget
    )

    requires_screen: bool
    requires_tools: bool

    missing_information: list[str] = Field(
        default_factory=list
    )

    reason: str