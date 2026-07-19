import subprocess
import os
import uuid
import platform
import time
import threading


# =====================================
# CONFIGURATION
# =====================================

TEMP_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "temp"
)

BINARY_EXPIRY_SECONDS = 300


# LLVM Clang installation
CLANG_PATH = r"D:\neuroGen\LLVM\bin\clang.exe"


# Visual Studio 2019 Build Tools
VCVARS64_PATH = (
    r"C:\Program Files (x86)\Microsoft Visual Studio"
    r"\2019\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
)


# =====================================
# MSVC ENVIRONMENT
# =====================================

def get_msvc_environment():
    """
    Load Visual Studio 2019 Build Tools x64 environment variables.
    """

    env_script = os.path.join(
        TEMP_DIR,
        "load_msvc_env.bat"
    )

    os.makedirs(TEMP_DIR, exist_ok=True)

    try:
        # Create temporary batch file
        with open(env_script, "w", encoding="utf-8") as f:
            f.write("@echo off\n")
            f.write(f'call "{VCVARS64_PATH}" >nul\n')
            f.write("if errorlevel 1 exit /b %errorlevel%\n")
            f.write("set\n")

        # Execute batch file
        result = subprocess.run(
            [
                r"C:\Windows\System32\cmd.exe",
                "/c",
                env_script
            ],
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            raise RuntimeError(
                "Failed to load Visual Studio environment.\n"
                + result.stderr
            )

        env = os.environ.copy()

        # Capture VS environment variables
        for line in result.stdout.splitlines():
            if "=" in line:
                key, value = line.split("=", 1)
                env[key] = value

        return env

    finally:
        # Delete temporary batch file
        if os.path.exists(env_script):
            try:
                os.remove(env_script)
            except OSError:
                pass


# =====================================
# OUTPUT EXTENSION
# =====================================

def get_output_extension():
    """
    Return executable extension based on operating system.
    """

    if platform.system() == "Windows":
        return ".exe"

    return ".out"


# =====================================
# CLEANUP
# =====================================

def cleanup_old_binaries():
    """
    Delete temporary files older than
    BINARY_EXPIRY_SECONDS.
    """

    try:

        if not os.path.exists(TEMP_DIR):
            return

        now = time.time()

        for filename in os.listdir(TEMP_DIR):

            filepath = os.path.join(
                TEMP_DIR,
                filename
            )

            if os.path.isfile(filepath):

                age = (
                    now
                    - os.path.getmtime(filepath)
                )

                if age > BINARY_EXPIRY_SECONDS:
                    os.remove(filepath)

    except Exception as e:

        print(
            f"Cleanup warning: {e}"
        )


def schedule_cleanup():
    """
    Run cleanup in a background thread.
    """

    thread = threading.Thread(
        target=cleanup_old_binaries,
        daemon=True
    )

    thread.start()


# =====================================
# COMPILER
# =====================================

def compile_c_code(code: str) -> dict:
    """
    Compile generated C code using Clang.
    """

    schedule_cleanup()

    # Generate unique compilation ID
    file_id = str(uuid.uuid4())[:8]

    source_file = os.path.join(
        TEMP_DIR,
        f"{file_id}.c"
    )

    output_file = os.path.join(
        TEMP_DIR,
        f"{file_id}{get_output_extension()}"
    )

    # Make sure temp directory exists
    os.makedirs(
        TEMP_DIR,
        exist_ok=True
    )

    try:

        # =====================================
        # SAVE GENERATED C CODE
        # =====================================

        with open(
            source_file,
            "w",
            encoding="utf-8"
        ) as f:

            f.write(code)


        # =====================================
        # WINDOWS
        # =====================================

        if platform.system() == "Windows":

            # Verify Clang installation
            if not os.path.exists(CLANG_PATH):

                raise FileNotFoundError(
                    f"Clang not found at: {CLANG_PATH}"
                )


            # Verify Visual Studio Build Tools
            if not os.path.exists(VCVARS64_PATH):

                raise FileNotFoundError(
                    "VS Build Tools environment "
                    f"not found at: {VCVARS64_PATH}"
                )


            # Load MSVC / Windows SDK environment
            msvc_env = get_msvc_environment()


            # Compile using Clang
            result = subprocess.run(
                [
                    CLANG_PATH,
                    source_file,
                    "-o",
                    output_file,
                    "-O2",
                    "-Wall"
                ],
                capture_output=True,
                text=True,
                timeout=60,
                env=msvc_env
            )


        # =====================================
        # LINUX / MACOS
        # =====================================

        else:

            result = subprocess.run(
                [
                    "clang",
                    source_file,
                    "-o",
                    output_file,
                    "-O2",
                    "-Wall"
                ],
                capture_output=True,
                text=True,
                timeout=30
            )


        # =====================================
        # COMPILATION SUCCESS
        # =====================================

        if result.returncode == 0:

            binary_size = os.path.getsize(
                output_file
            )

            # Clang may put warnings in stderr
            warnings = result.stderr.strip()

            if warnings:
                logs = warnings
            else:
                logs = (
                    "Compilation successful — "
                    "no warnings."
                )

            return {
                "success": True,
                "file_id": file_id,
                "output_file": output_file,
                "binary_size": binary_size,
                "logs": logs,
                "errors": ""
            }


        # =====================================
        # COMPILATION FAILED
        # =====================================

        return {
            "success": False,
            "file_id": None,
            "output_file": None,
            "binary_size": 0,
            "logs": result.stdout,
            "errors": result.stderr
        }


    # =====================================
    # TIMEOUT
    # =====================================

    except subprocess.TimeoutExpired:

        return {
            "success": False,
            "file_id": None,
            "output_file": None,
            "binary_size": 0,
            "logs": "",
            "errors":
                "Compilation timed out after 60 seconds."
        }


    # =====================================
    # FILE NOT FOUND
    # =====================================

    except FileNotFoundError as e:

        return {
            "success": False,
            "file_id": None,
            "output_file": None,
            "binary_size": 0,
            "logs": "",
            "errors": str(e)
        }


    # =====================================
    # OTHER ERRORS
    # =====================================

    except Exception as e:

        return {
            "success": False,
            "file_id": None,
            "output_file": None,
            "binary_size": 0,
            "logs": "",
            "errors":
                f"Unexpected compilation error: {str(e)}"
        }


    # =====================================
    # CLEAN SOURCE FILE
    # =====================================

    finally:

        if os.path.exists(source_file):

            try:
                os.remove(source_file)

            except OSError:
                pass