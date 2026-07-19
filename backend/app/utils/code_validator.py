import re

def validate_c_code(code: str) -> dict:
    """
    Validate generated C code before passing to compiler.
    Returns { valid: bool, error: str }
    """

    # Check empty
    if not code or not code.strip():
        return {
            "valid": False,
            "error": "Generated code is empty. Please try again."
        }

    # Check minimum length
    if len(code.strip()) < 20:
        return {
            "valid": False,
            "error": "Generated code is too short to be valid C."
        }

    # Must contain #include
    if "#include" not in code:
        return {
            "valid": False,
            "error": "Generated code is missing #include headers."
        }

    # Must contain a main function
    if "main(" not in code and "main (" not in code:
        return {
            "valid": False,
            "error": "Generated code is missing a main() function."
        }

    # Check balanced braces
    open_braces = code.count("{")
    close_braces = code.count("}")
    if open_braces != close_braces:
        return {
            "valid": False,
            "error": f"Unbalanced braces in generated code ({open_braces} open, {close_braces} close). Try regenerating."
        }

    # Check for markdown leftovers the cleaner might have missed
    if "```" in code:
        return {
            "valid": False,
            "error": "Generated code contains markdown artifacts. Try regenerating."
        }

    # Check for common non-code output patterns
    explanation_patterns = [
        r"^This (program|code|function)",
        r"^The (program|code|function|above)",
        r"^Here (is|are)",
        r"^In this",
        r"^Note:",
    ]
    first_line = code.strip().split("\n")[0].strip()
    for pattern in explanation_patterns:
        if re.match(pattern, first_line, re.IGNORECASE):
            return {
                "valid": False,
                "error": "Generated output contains explanation text instead of code. Try regenerating."
            }

    return {"valid": True, "error": ""}