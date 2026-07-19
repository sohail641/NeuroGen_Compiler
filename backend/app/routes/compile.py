from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.models.compile import CompileRequest, CompileResponse
from app.utils.compiler_utils import compile_c_code, TEMP_DIR
import os
import platform

router = APIRouter(prefix="/compile", tags=["Compiler"])


@router.post("/", response_model=CompileResponse)
async def compile_code(request: CompileRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="No code provided")

    result = compile_c_code(request.code)

    if result["success"]:
        size_kb = round(result["binary_size"] / 1024, 2)
        return CompileResponse(
            success=True,
            file_id=result["file_id"],
            binary_size=result["binary_size"],
            logs=result["logs"],
            errors="",
            message=f"Compiled successfully — binary size: {size_kb} KB"
        )
    else:
        return CompileResponse(
            success=False,
            file_id=None,
            binary_size=0,
            logs=result["logs"],
            errors=result["errors"],
            message="Compilation failed — see errors below"
        )


@router.get("/download/{file_id}")
async def download_binary(file_id: str):
    ext = ".exe" if platform.system() == "Windows" else ".out"
    file_path = os.path.join(TEMP_DIR, f"{file_id}{ext}")

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Binary not found. It may have expired — please recompile."
        )

    filename = f"neurogencompiler_{file_id}{ext}"
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )