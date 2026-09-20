from services.stt import STTService
from fastapi import FastAPI,UploadFile, File
from dotenv import load_dotenv
load_dotenv()
stt = STTService()
app = FastAPI()  # Initialize FastAPI application

@app.get("/health")
def health_check():
    return {"status": "healthy"}


stt=STTService() # Create an instance of the STTService class to handle speech-to-text operations
@app.post("/transcribe")
async def transcribe_audio(file: UploadFile=File(...)): # Accepts an audio file upload where the file is required and must be provided in the request body
    audio=await file.read() # Read the contents of the uploaded audio file asynchronously because it may be large and we don't want to block the event loop while reading it

    text = await stt.transcribe( # Call the transcribe method of the STTService instance
        audio,
        file.filename or "audio.webm"
    )

    return {
        "text": text
    }