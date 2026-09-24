from pydantic import BaseModel
from typing import Literal
import os
import json
from groq import AsyncGroq # Import the AsyncGroq class from the groq module to handle asynchronous requests to the Groq API
from schemas.intent import IntentResult # Import the IntentResult model from the schemas.intent module to validate the response from the Groq API


class IntentRouter:
    def __init__(self):
        api_key=os.getenv("GROQ_API_KEY") # Retrieve the Groq API key from the environment variables
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set") # Raise an error if the Groq API key is not set
        self.client=AsyncGroq(api_key=api_key) # Initialize the AsyncGroq client with the provided API key
    async def route(self, text: str) -> IntentResult: # Define a method to handle intent routing based on the provided text
        #LLM logic to determine intent and target based on the text
        response = await self.client.chat.completions.create(
            model= "openai/gpt-oss-20b",  # Specify the model to use for generating completions
            temperature=0.2,  # Set the temperature for randomness in the generated text
            response_format={"type":"json_object"},
            messages=[
                {
                    "role": "system",
                    "content": """
                You are Halo's intent router.

                Your ONLY job is to understand what the user wants.

                Do not perform the task.
                Do not invent capabilities.
                Do not upgrade the user's requested autonomy.

                Allowed modes:
                - answer
                - guide
                - act
                - delegate

                Allowed intents:
                - answer_question
                - explain
                - search_web
                - open_application
                - navigate_ui
                - create_content
                - edit_content

                If the request is ambiguous or missing information required to classify it safely,
                return status="clarify".

                The user's request for information must never automatically become an action.

                Return ONLY valid JSON matching this structure:

                {
                "status": "ok" | "clarify",
                "mode": "answer" | "guide" | "act" | "delegate" | null,
                "intent": "answer_question" | "explain" | "search_web" | "open_application" | "navigate_ui" | "create_content" | "edit_content" | null,
                "target": {
                    "application": "string or null"
                },
                "requires_screen": true,
                "requires_tools": false,
                "missing_information": [],
                "reason": "string"
                }
                """,
                },
                {
                    "role": "user",
                    "content": text,
                },
            ],
        )

        raw = response.choices[0].message.content # Extract the content of the first message in the response choices from Groq 

        if not raw:
            raise ValueError("Groq returned an empty response")

        data = json.loads(raw) # Parse the raw JSON string into a Python dictionary because the response from Groq is expected to be in JSON format

        return IntentResult.model_validate(data) # Validate the parsed data against the IntentResult model and return an instance of IntentResult
        pass


