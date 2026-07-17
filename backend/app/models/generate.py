from pydantic import BaseModel

class GenerateRequest(BaseModel):
    instruction: str

class GenerateResponse(BaseModel):
    code: str
    instruction: str