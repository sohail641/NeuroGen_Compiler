from pydantic import BaseModel


class CompileRequest(BaseModel):
    code: str
    instruction: str = ""


class CompileResponse(BaseModel):
    success: bool
    file_id: str | None = None
    binary_size: int
    logs: str
    errors: str
    message: str