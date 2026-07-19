import httpx
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5-coder:3b"

SYSTEM_PROMPT = """You are a C code generator. Output ONLY C code. No explanations. No text. No markdown. Just C code starting with #include."""

def clean_code(raw: str) -> str:
    # Strip markdown fences
    raw = re.sub(r"```[a-zA-Z]*", "", raw)
    raw = raw.replace("```", "")

    # Find where actual C code starts
    code_start = -1

    for keyword in ["#include", "#define", "int main", "void main"]:
        idx = raw.find(keyword)

        if idx != -1:
            if code_start == -1 or idx < code_start:
                code_start = idx

    if code_start != -1:
        raw = raw[code_start:]

    # Remove anything after final closing brace
    last_brace = raw.rfind("}")

    if last_brace != -1:
        raw = raw[:last_brace + 1]

    return raw.strip()

    # Strip markdown fences
    raw = re.sub(r"```[a-zA-Z]*", "", raw)
    raw = raw.replace("```", "")

    # Find where actual C code starts — look for #include or int main
    
async def generate_code(instruction: str) -> str:
    prompt = f"""
Generate a complete ANSI C program.

Rules:
- Output ONLY C code.
- Do not use markdown.
- Do not explain.
- The first line must be:
#include <stdio.h>

Task:
{instruction}
"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                   "temperature": 0.1
                       }
        })

        if response.status_code != 200:
            raise Exception(
    f"Ollama returned {response.status_code}: {response.text}"
)

        result = response.json()
        # Prepend #include since we used it as the prompt starter
        code = result.get("response", "").strip()
        return clean_code(code)