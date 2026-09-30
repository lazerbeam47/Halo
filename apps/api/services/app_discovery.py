from pathlib import Path
from typing import Dict,List


APPLICATIONS_DIRECTORIES=[
    Path("/Applications"),
    Path("/System/Applications"),
    Path.home()/"Applications",
]

class ApplicationDiscovery: # Define a class to discover installed applications on the system which scans predefined directories for application bundles and returns a list of discovered applications with their names and paths
    def discover(self) -> List[Dict[str, str]]:  # Define a method to discover applications which returns a list of dictionaries containing the name and path of each discovered application
        applications = []

        seen = set() # Initialize a set to keep track of seen application names to avoid duplicates

        for directory in APPLICATIONS_DIRECTORIES:
            if not directory.exists(): # Check if the directory exists, and if it does not, skip to the next directory
                continue

            for app_path in directory.glob("*.app"): # Iterate over all application bundles in the directory using a glob pattern to match files with the .app extension
                name = app_path.stem

                if name in seen:
                    continue

                seen.add(name)

                applications.append(
                    {
                        "name": name,
                        "path": str(app_path),
                    }
                )

        applications.sort( # Sort the list of applications alphabetically by name, ignoring case, to provide a consistent and user-friendly order
            key=lambda app: app["name"].lower() # Sort the applications by name in a case-insensitive manner where lambda app: app["name"].lower() is a function that takes an application dictionary and returns the lowercase version of its name for sorting purposes
        )

        return applications