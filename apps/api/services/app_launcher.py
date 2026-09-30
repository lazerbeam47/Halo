
import subprocess # Import the subprocess module to run shell commands which is used to discover installed applications on the system

class AppLauncher:
    def launch(self, application:str)->None: # Define a method to launch an application given its path which uses the subprocess module to execute the open command on macOS
        try:
            subprocess.run(
                ["open","-a",application],
                check=True,
            )
        except subprocess.CalledProcessError as error: # Handle any errors that occur during the launch process by catching CalledProcessError exceptions and printing an error message
            raise RuntimeError(
                f"Failed to launch application: {application}"
            ) from error