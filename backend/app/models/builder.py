from pydantic import BaseModel

class BuildRequest(BaseModel):
    instruction: str

class BuildResponse(BaseModel):
    success: bool
    instruction: str
    code: str
    file_id: str | None
    binary_size: int
    binary_size_kb: float
    logs: str
    errors: str
    validation_error: str
    message: str