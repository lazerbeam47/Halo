import json
from pathlib import Path # Import the Path class from the pathlib module to handle file paths which is used to manage the permissions file location and ensure the directory exists
from typing import Dict # Import the Dict type from the typing module to specify the type of the permissions dictionary which maps application names to their capabilities and their allowed status


class PermissionManager: # Define a class to manage application permissions which handles loading, saving, and checking permissions for different applications and their capabilities
    def __init__(self):
        self.permissions: Dict[str, Dict[str, bool]] = {} # Initialize an empty dictionary to store permissions for different applications and their capabilities
        self._load() # Load existing permissions from the permissions file when the PermissionManager is instantiated

    @property
    def permissions_file(self) -> Path: # Define a property to get the path to the permissions file which is located in the user's home directory under .halo/permissions.json
        path = Path.home() / ".halo" / "permissions.json" # Construct the path to the permissions file in the user's home directory
        path.parent.mkdir(parents=True, exist_ok=True) # Ensure that the parent directory exists, creating it if necessary
        return path

    def _load(self) -> None: # Define a method to load permissions from the permissions file which reads the JSON file and populates the permissions dictionary, handling cases where the file does not exist or is malformed
        if not self.permissions_file.exists(): # Check if the permissions file exists, and if it does not, initialize an empty permissions dictionary
            self.permissions = {}
            return

        try:
            with open(self.permissions_file, "r") as file: # Open the permissions file in read mode and load its contents as JSON into the permissions dictionary
                self.permissions = json.load(file)
        except (json.JSONDecodeError, OSError):
            self.permissions = {}

    def _save(self) -> None: # Define a method to save the current permissions to the permissions file which writes the permissions dictionary as JSON to the file, creating the file if it does not exist
        with open(self.permissions_file, "w") as file: # Open the permissions file in write mode and dump the current permissions dictionary as JSON into the file, formatting it with an indentation of 2 spaces for readability
            json.dump(self.permissions, file, indent=2)

    def is_allowed(self, app: str, capability: str) -> bool: # Define a method to check if a specific capability is allowed for a given application which returns True if the capability is granted, and False otherwise
        return self.permissions.get(app, {}).get(capability, False)

    def grant(self, app: str, capability: str) -> None: # Define a method to grant a specific capability to a given application which updates the permissions dictionary and saves the changes to the permissions file
        if app not in self.permissions:
            self.permissions[app] = {}

        self.permissions[app][capability] = True
        self._save()

    def revoke(self, app: str, capability: str) -> None: # Define a method to revoke a specific capability from a given application which updates the permissions dictionary and saves the changes to the permissions file
        if app not in self.permissions:
            return

        self.permissions[app][capability] = False
        self._save()

    def get_app_permissions(self, app: str) -> Dict[str, bool]: # Define a method to retrieve all permissions for a given application which returns a copy of the permissions dictionary for that application, or an empty dictionary if the application has no permissions set
        return self.permissions.get(app, {}).copy()