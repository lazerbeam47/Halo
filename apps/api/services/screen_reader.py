import subprocess # it is used to run the screencapture command in a subprocess. subprocess is a built-in Python module that allows you to spawn new processes, connect to their input/output/error pipes, and obtain their return codes.
from pathlib import Path # it is used to handle file paths in a platform-independent way
import tempfile # it is used to create a temporary file for the screenshot
from PIL import Image,ImageDraw # it is used to open and manipulate the captured screenshot image

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
    
    def validate_bounds(self, image_path:str, bounds:dict)->bool: #this 
        with Image.open(image_path) as img: # Open the image at the given path using PIL
            img_width, img_height = img.size # Get the width and height of the image

        x=bounds["x"] # Get the x coordinate of the bounding box
        y=bounds["y"] # Get the y coordinate of the bounding box
        width=bounds["width"] # Get the width of the bounding box
        height=bounds["height"] # Get the height of the bounding box

        print("screen size", img_width, img_height)
        print("detected bounds", x, y, width, height)
        if width<=0 or height<=0: # Check if the width or height is less than or equal to zero
            print("invalid bounds: width or height is less than or equal to zero")
            return False    
        
        if x<0 or y<0: # Check if the x or y coordinate is less than zero
            print("invalid bounds: x or y is less than zero")
            return False

        if x+width>img_width or y+height>img_height: # Check if the bounding box exceeds the image dimensions
            print("invalid bounds: bounding box exceeds image dimensions")
            return 
        
        print("valid bounds")
        return True
        
    def annotate(self,image_path:str, bounds:dict, label:str)->str:
        with Image.open(image_path) as image: 

            image=image.convert("RGB") # Convert the image to RGB mode if it is not already in that mode
            draw=ImageDraw.Draw(image) # Create a drawing context for the image

            x=bounds["x"] # Get the x coordinate of the bounding box
            y=bounds["y"] # Get the y coordinate of the bounding box
            width=bounds["width"] # Get the width of the bounding box
            height=bounds["height"] # Get the height of the bounding box

            draw.rectangle(
                (x, y, x + width, y + height),
                outline="red",
                width=4,
            )

            draw.text(
                (x, max(0, y - 20)),
                label,
                fill="red",
            )

            output_path = image_path.replace(
                ".png",
                "-annotated.png",
            )

            image.save(output_path)

        return output_path
