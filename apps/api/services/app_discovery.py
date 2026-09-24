from pathlib import Path
from typing import Dict

APPLICATIONS_DIRECTORIES=[
    Path("/Applications"),
    Path("/System/Applications"),
    Path.home()/"Applications",
]

class ApplicationDiscovery: # Define a class to discover installed applications on the system which scans predefined directories for application bundles and returns a list of discovered applications with their names and paths
    def discover(self) -> List[Dict[str, str]]: 
        applications = []

        seen = set()

        for directory in APPLICATIONS_DIRECTORIES:
            if not directory.exists():
                continue

            for app_path in directory.glob("*.app"):
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

        applications.sort(
            key=lambda app: app["name"].lower()
        )

        return applications