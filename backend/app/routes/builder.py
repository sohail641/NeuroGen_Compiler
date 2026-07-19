from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models.builder import BuildRequest, BuildResponse
from app.utils.llm_utils import generate_code
from app.utils.code_validator import validate_c_code
from app.utils.compiler_utils import compile_c_code, TEMP_DIR
import os
import platform

router = APIRouter(prefix="/compiler", tags=["NeuroGen Builder"])


@router.post("/build", response_model=BuildResponse)
async def build(request: BuildRequest):
    """
    Full pipeline endpoint:
    Instruction → Generate C code → Validate → Compile → Return binary
    """

    if not request.instruction.strip():
        raise HTTPException(status_code=400, detail="Instruction cannot be empty")

    if len(request.instruction) > 500:
        raise HTTPException(status_code=400, detail="Instruction too long (max 500 chars)")

    # ── Step 1: Generate code with LLM ──────────────────────────
    try:
        code = await generate_code(request.instruction)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Code generation failed: {str(e)}"
        )

    # ── Step 2: Validate generated code ─────────────────────────
    validation = validate_c_code(code)
    if not validation["valid"]:
        return BuildResponse(
            success=False,
            instruction=request.instruction,
            code=code,
            file_id=None,
            binary_size=0,
            binary_size_kb=0.0,
            logs="",
            errors="",
            validation_error=validation["error"],
            message="Validation failed — code quality check did not pass"
        )

    # ── Step 3: Compile with Clang ───────────────────────────────
    result = compile_c_code(code)

    if result["success"]:
        size_kb = round(result["binary_size"] / 1024, 2)
        return BuildResponse(
            success=True,
            instruction=request.instruction,
            code=code,
            file_id=result["file_id"],
            binary_size=result["binary_size"],
            binary_size_kb=size_kb,
            logs=result["logs"],
            errors="",
            validation_error="",
            message=f"Build successful — binary size: {size_kb} KB"
        )
    else:
        return BuildResponse(
            success=False,
            instruction=request.instruction,
            code=code,
            file_id=None,
            binary_size=0,
            binary_size_kb=0.0,
            logs=result["logs"],
            errors=result["errors"],
            validation_error="",
            message="Compilation failed — see errors below"
        )


@router.get("/download/{file_id}")
async def download_binary(file_id: str):
    ext = ".exe" if platform.system() == "Windows" else ".out"
    file_path = os.path.join(TEMP_DIR, f"{file_id}{ext}")

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Binary expired or not found. Please rebuild."
        )

    return FileResponse(
        path=file_path,
        filename=f"neurogencompiler_{file_id}{ext}",
        media_type="application/octet-stream"
    )