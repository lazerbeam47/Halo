import os
import DeepgramClient from "deepgram-sdk"

class STTService:
    def __init__(self):
        api_key=os.getenv("DEEPGRAM_API_KEY")
        if not api_key:
            raise ValueError("DEEPGRAM_API_KEY environment variable is not set.")
        self.client = DeepgramClient(api_key=api_key)

    async def transcribe(self, audio: bytes, filename: str) -> str:
        response = self.client.listen.v1.media.transcribe_file(
            audio,
            model="nova-3",
            smart_format=True,
        )

        return response.results.channels[0].alternatives[0].transcript # Return the transcribed text from the Deepgram API response where channels[0] is the first audio channel, alternatives[0] is the most likely transcription, and transcript is the actual transcribed text.