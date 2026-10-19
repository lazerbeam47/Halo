from typing import List, Literal , Optional
from pydantic import BaseModel


class Bounds(BaseModel): # Define a Pydantic model for the bounds of a screen element with four integer fields: x, y, width, and height
    x:int
    y:int
    width:int
    height:int
 
class ScreenElement(BaseModel): # Define a Pydantic model for a screen element with three fields: type, label, and bounds. The type field is a literal that can only take one of the specified values, the label field is a string, and the bounds field is an instance of the Bounds model
    type: str
    label: str
    bounds: Bounds


class ScreenAnalysis(BaseModel): # Define a Pydantic model for the analysis of a screen with two fields: application and elements. The application field is a string representing the name of the application currently in focus, and the elements field is a list of ScreenElement instances representing the various elements present on the screen
    application: str
    elements: List[ScreenElement]

class ScreenFindRequest(BaseModel): # Define a Pydantic model for a request to find a specific element on the screen with a single field: target. The target field is a string representing the label of the element to be found
    target: str

class ScreenFindResult(BaseModel):
    found: bool
    element: Optional[ScreenElement] = None