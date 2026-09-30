import subprocess # it is used to run the screencapture command in a subprocess. subprocess is a built-in Python module that allows you to spawn new processes, connect to their input/output/error pipes, and obtain their return codes.
from pathlib import Path # it is used to handle file paths in a platform-independent way
import tempfile # it is used to create a temporary file for the screenshot

class ScreenReader:
    def capture(self)->str: # This method captures the screen and saves it to a file
        output_path=Path( # Create a Path object for the output file
            tempfile.gettempdir() # Get the temporary directory
        )/"halo-screen.png"

        result=subprocess.run( # Run the screencapture command
            [
                "screencapture", # The command-line utility to capture the screen on macOS
                "-x", # The -x option tells screencapture to not play the camera sound
                str(output_path),
            ],
            capture_output=True, # Capture the output of the command
            text=True, # Return the output as a string instead of bytes
        )
        if result.returncode!=0:
            raise RuntimeError(
                f"Screen capture failed: {result.stderr.strip()}"
            )

        return str(output_path)
