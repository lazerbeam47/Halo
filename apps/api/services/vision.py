import base64
import os

from groq import Groq


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

    def analyze(
        self,
        image_path: str,
        prompt: str,
    ) -> str:
        image_base64 = self.encode_image(image_path)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt,
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
            max_completion_tokens=1024,
        )

        return response.choices[0].message.content