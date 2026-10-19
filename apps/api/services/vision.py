import base64
import os
import json
from groq import Groq
from schemas.screen import ScreenAnalysis
from schemas.screen import ScreenFindResult


class VisionService:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise ValueError("GROQ_API_KEY is not set")

        self.client = Groq(api_key=api_key)
        self.model = "qwen/qwen3.8-27b"

    def encode_image(self, image_path: str) -> str:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(
                image_file.read()
            ).decode("utf-8")
    
    def find(self, image_path:str, target:str)->ScreenFindResult:
        image_base64=self.encode_image(image_path) # Encode the image at the given path to a base64 string because the Groq API requires images to be sent in base64 format

        prompt = f"""
You are a computer-use vision system.

Find this specific UI element in the provided screenshot:
TARGET: "{target}"

Carefully inspect the actual screenshot and locate the
target visually before estimating its bounding box.

Return ONLY valid JSON.

If the target is clearly visible, return:

{{
  "found": true,
  "element": {{
    "type": "button",
    "label": "visible label",
    "bounds": {{
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0
    }}
  }}
}}

If the target is not visible or cannot be identified
confidently, return:

{{
  "found": false,
  "element": null
}}

Rules:
- Find only the requested target.
- Do not return unrelated elements.
- Use the visible label when possible.
- x and y are the top-left corner of the element.
- width and height describe its visible bounding box.
- Coordinates must be relative to the screenshot's top-left corner.
- Use screenshot pixel coordinates, not estimated screen coordinates.
- Do not guess based on typical UI layouts.
- Do not invent invisible elements.
- Do not include markdown or explanations.
"""
        response = self.client.chat.completions.create( # Create a chat completion request to the Groq API using the specified model and messages
            model=self.model, 
            messages=[
                {
                    "role":"user",
                    "content":[
                        {
                            "type":"text",
                            "text":prompt,
                        },
                        {
                            "type":"image_url",
                            "image_url":{
                                "url":f"data:image/png;base64,{image_base64}", # Set the image URL to a data URI containing the base64-encoded image
                            },
                        },
                    ],
                }
            ],
            max_completion_tokens=400,
        )
        content = response.choices[0].message.content.strip() # Get the content of the first choice in the response and strip any leading/trailing whitespace
        if content.startswith("```"):
            content = content.replace("```json","",1) # Remove the opening code block marker if it exists where the language is specified as JSON and 1 is the count of occurrences to replace
            content = content.replace("```","",1) # Remove the closing code block marker if it exists and 1 is the count of occurrences to replace
            content = content.strip() # Strip any leading/trailing whitespace again after removing the code block markers

        data = json.loads(content) # Parse the content as JSON and store it in the data variable
        if not data.get("found"):
            return ScreenFindResult(
                found=False,
                element=None,
            )
            return None

        return ScreenFindResult.model_validate(data) # Validate and return the found element

    def analyze(self, image_path: str) -> str:
        image_base64 = self.encode_image(image_path) # Encode the image at the given path to a base64 string

        response = self.client.chat.completions.create( # Create a chat completion request to the Groq API using the specified model and messages
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """
Analyze this screenshot for computer interaction.

Identify ONLY the most important interactive UI elements visible on screen.

Return at most 8 elements.

Prioritize:
- buttons
- inputs
- menus
- tabs
- important controls

Do NOT include:
- normal text
- file names
- decorative icons
- repeated elements
- every item in a sidebar

For each element provide:
- type
- label
- bounding box

The bounding box must use pixel coordinates relative to
the top-left corner of the screenshot.

Return ONLY valid JSON.

Format:

{
  "application": "string",
  "elements": [
    {
      "type": "button",
      "label": "string",
      "bounds": {
        "x": 0,
        "y": 0,
        "width": 0,
        "height": 0
      }
    }
  ]
}

Do not include markdown.
Do not include explanations.
""",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": (
                                    "data:image/png;base64,"
                                    f"{image_base64}"
                                ),
                            },
                        },
                    ],
                }
            ],
            max_completion_tokens=800, # Set the maximum number of tokens for the completion response to 2048
        )

        content = response.choices[0].message.content

        content = content.strip()

        if content.startswith("```"):
            content = content.replace("```json", "", 1)
            content = content.replace("```", "", 1)
            content = content.strip()

        print("VISION RAW OUTPUT:")
        print(content)
        print("VISION OUTPUT LENGTH:", len(content))
        data = json.loads(content)

        return ScreenAnalysis.model_validate(data)