from typing import Literal
from schemas.intent import IntentResult


ExecutionAction = Literal[
    "answer",
    "start_guidance",
    "execute_action",
    "start_agent",
    "clarify",
]


class ExecutionStrategy:

    def decide(self, intent: IntentResult) -> dict:
        if intent.status == "clarify":
            return {
                "action": "clarify",
                "requires_screen": False,
                "requires_tools": False,
                "requires_confirmation": False,
            }

        if intent.mode == "answer":
            return {
                "action": "answer",
                "requires_screen": intent.requires_screen,
                "requires_tools": intent.requires_tools,
                "requires_confirmation": False,
            }

        if intent.mode == "guide":
            return {
                "action": "start_guidance",
                "requires_screen": True,
                "requires_tools": False,
                "requires_confirmation": False,
            }

        if intent.mode == "act":
            return {
                "action": "execute_action",
                "requires_screen": intent.requires_screen,
                "requires_tools": True,
                "requires_confirmation": False,
            }

        if intent.mode == "delegate":
            return {
                "action": "start_agent",
                "requires_screen": True,
                "requires_tools": True,
                "requires_confirmation": False,
            }

        raise ValueError(
            f"Unable to determine execution strategy for mode: {intent.mode}"
        )