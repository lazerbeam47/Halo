from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class Capability:
    name: str
    requires_screen: bool
    requires_tools: bool
    requires_confirmation: bool


CAPABILITIES = {
    "answer_question": Capability(
        name="answer_question",
        requires_screen=False,
        requires_tools=False,
        requires_confirmation=False,
    ),

    "explain": Capability(
        name="explain",
        requires_screen=False,
        requires_tools=False,
        requires_confirmation=False,
    ),

    "search_web": Capability(
        name="search_web",
        requires_screen=False,
        requires_tools=True,
        requires_confirmation=False,
    ),

    "open_application": Capability(
        name="open_application",
        requires_screen=False,
        requires_tools=True,
        requires_confirmation=False,
    ),

    "navigate_ui": Capability(
        name="navigate_ui",
        requires_screen=True,
        requires_tools=True,
        requires_confirmation=False,
    ),

    "create_content": Capability(
        name="create_content",
        requires_screen=True,
        requires_tools=True,
        requires_confirmation=False,
    ),

    "edit_content": Capability(
        name="edit_content",
        requires_screen=True,
        requires_tools=True,
        requires_confirmation=False,
    ),
}