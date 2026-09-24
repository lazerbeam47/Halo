import os
from deepgram import DeepgramClient


class STTService:
    def __init__(self):
        api_key = os.getenv("DEEPGRAM_API_KEY")

        if not api_key:
            raise ValueError("DEEPGRAM_API_KEY is not set")

        self.client = DeepgramClient(api_key=api_key)

    async def transcribe(
        self,
        audio: bytes,
        filename: str,
    ) -> str:

        response = self.client.listen.v1.media.transcribe_file(
            request=audio,
            model="nova-3",
            smart_format=True,
        )

        return response.results.channels[0].alternatives[0].transcript # Return the transcribed text from the Deepgram API response where the transcript is located in the first alternative of the first channel of the results and the response is returned as a string