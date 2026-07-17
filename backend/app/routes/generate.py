from fastapi import APIRouter, HTTPException
from app.models.generate import GenerateRequest, GenerateResponse
from app.utils.llm_utils import generate_code

router = APIRouter(prefix="/generate", tags=["Code Generation"])


@router.post("/", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    if not request.instruction.strip():
        raise HTTPException(status_code=400, detail="Instruction cannot be empty")

    if len(request.instruction) > 500:
        raise HTTPException(status_code=400, detail="Instruction too long (max 500 chars)")

    try:
        code = await generate_code(request.instruction)
        return GenerateResponse(
            code=code,
            instruction=request.instruction
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code generation failed: {str(e)}")