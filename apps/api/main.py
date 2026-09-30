from services.stt import STTService
from fastapi import FastAPI,UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.intent_router import IntentRouter
from dotenv import load_dotenv
from schemas.intent import IntentRequest
from services.execution_strategy import ExecutionStrategy
from permissions.manager import PermissionManager
from services.intent_router import IntentRouter
from services.intent_validator import IntentValidator
from services.app_discovery import ApplicationDiscovery
from services.app_launcher import AppLauncher
from services.screen_reader import ScreenReader
from fastapi.responses import FileResponse
from services.vision import VisionService

load_dotenv()
stt = STTService()
app = FastAPI()  # Initialize FastAPI application
permission_manager = PermissionManager()  # Create an instance of the PermissionsManager class to handle permission management
app_discovery = ApplicationDiscovery()  # Create an instance of the ApplicationDiscovery class to handle application discovery
app_launcher = AppLauncher()  # Create an instance of the AppLauncher class to handle application launching
screen_reader = ScreenReader()  # Create an instance of the ScreenReader class to handle screen capturing
vision_service = VisionService()  # Create an instance of the VisionService class to handle image processing

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
class IntentRequest(BaseModel):
    text: str  # Define a Pydantic model for the request body with a single field 'text' of type string

intent_router = IntentRouter()  # Create an instance of the IntentRouter class to handle intent routing

intent_validator = IntentValidator()  # Create an instance of the IntentValidator class to validate the intent results

execution_strategy = ExecutionStrategy()  # Create an instance of the ExecutionStrategy class to handle decision-making based on the intent results

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

@app.post("/intent")
async def handle_intent(request: IntentRequest): # Accepts a request body that conforms to the IntentRequest model defined earlier
    result = await intent_router.route(request.text) # Call the route method of the IntentRouter instance to determine the appropriate action based on the provided text
    validated_result=intent_validator.validate(result) # Validate the result returned by the intent router to ensure it conforms to expected formats and rules
    execution=execution_strategy.decide(validated_result) # Call the decide method of the ExecutionStrategy instance to determine the next steps based on the validated intent result
    print("INTENT → result:", validated_result) # Print the validated result to the console for debugging purposes
    return validated_result # Return the validated result as the response to the client

@app.get("/permissions")
def get_permissions():
    return permission_manager.permissions  # Return the current permissions dictionary managed by the PermissionsManager instance

@app.get("/permissions/{app_name}")
def get_app_permissions(app_name: str):
    return permission_manager.get_app_permissions(app_name)  # Return the permissions for a specific application by calling the get_app_permissions method of the PermissionsManager instance

@app.post("/permissions/{app_name}/grant")
def grant_permission(app_name: str, capability: str):
    permission_manager.grant(app_name, capability)  # Grant a specific capability to an application by calling the grant method of the PermissionsManager instance
    return {"app": app_name, "capability": capability, "status": "granted"}  # Return a confirmation response indicating that the permission has been granted

@app.post("/permissions/{app_name}/revoke")
def revoke_permission(app_name: str, capability: str):
    permission_manager.revoke(app_name, capability)  # Revoke a specific capability from an application by calling the revoke method of the PermissionsManager instance
    return {"app": app_name, "capability": capability, "status": "revoked"}  # Return a confirmation response indicating that the permission has been revoked

@app.get("/applications")
def get_applications():
    return app_discovery.discover()

@app.post("/execute")
async def execute_intent(intent: IntentRequest): # Accepts a request body that conforms to the IntentRequest model defined earlier
    result = await intent_router.route(intent.text) # Call the route method of the IntentRouter instance to determine the appropriate action based on the provided text
    result = intent_validator.validate(result) # Validate the result returned by the intent router to ensure it conforms to expected formats and rules

    if result.status == "clarify":
        return result

    if result.intent == "open_application":
        application = result.target.application

        if not application:
            return {
                "status": "clarify",
                "reason": "Application is required.",
            }

        if not permission_manager.is_allowed(
            application,
            "launch",
        ):
            return {
                "status": "permission_required",
                "application": application,
                "capability": "launch",
            }

        app_launcher.launch(application)

        return {
            "status": "executed",
            "intent": "open_application",
            "application": application,
        }

    return {
        "status": "unsupported",
        "reason": f"Execution for {result.intent} is not implemented yet.",
    }

@app.post("/screen/capture")
def capture_screen():
    path = screen_reader.capture()

    return FileResponse(
        path,
        media_type="image/png",
        filename="halo-screen.png",
    )

@app.post("/screen/analyze")
def analyze_screen():
    path = screen_reader.capture() # Capture the current screen and save it to a file, returning the file path
    descriprion = vision.analyze(
        path,
        """
        Describe what is currently visible on the user's screen.
        Identify:
        -the main application or window
        -important visible UI elements
        -buttons,menus,inputs,dialogs, and text
        -anything that appears relevant for the interacting with the screen
        
        Keep the response concise and factual.
        """,
    )
    return {
        "status":"analyzed",
        "description":descriprion
    }