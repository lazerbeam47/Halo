from schemas.intent import IntentResult

class IntentValidator:
    ALLOWED_MODES = {
        "answer",
        "guide",
        "act",
        "delegate",
    }
    ALLOWED_INTENTS = {
        "answer_question",
        "explain",
        "search_web",
        "open_application",
        "navigate_ui",
        "create_content",
        "edit_content",
    }

    def validate(self, result:IntentResult)->IntentResult:
        #clarification is a already a valid route outcome
        if result.status == "clarify":
            return result
        
        #validate mode
        if result.mode not in self.ALLOWED_MODES:
            raise ValueError(f"Invalid mode: {result.mode}. Allowed modes are: {self.ALLOWED_MODES}")
        
        #validate intent
        if result.intent not in self.ALLOWED_INTENTS:
            raise ValueError(f"Invalid intent: {result.intent}. Allowed intents are: {self.ALLOWED_INTENTS}")

        #ui-related intents required a target application
        ui_intents={
            "open_application",
            "navigate_ui",
            "create_content",
            "edit_content",
        }

        if result.intent in ui_intents: # Check if the intent is UI-related meaning it requires a target application to be specified
            if not result.target.application: # Check if the target application is not specified in the result likely because the user did not provide enough information for the system to determine which application to open, navigate, create content in, or edit content in
                return result.model_copy( # Create a copy of the result with updated information
                    update={
                        "status":"clarify",
                        "missing_information":["target.application"],
                        "reason":("an application is required for this UI task"),
                    }
                )
        
        return result