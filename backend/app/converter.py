import subprocess
from pathlib import Path
from .config import settings


class ConversionError(Exception):
    pass


def convert_to_pdf(input_path: Path, output_dir: Path) -> Path:
    """
    Convert a .doc or .docx to PDF using LibreOffice headless. Returns the output PDF path.
    Raises ConversionError on failure.
    """
    if not input_path.exists():
        raise ConversionError(f"Input not found: {input_path}")

    # LibreOffice will write to output_dir with the same base name and .pdf extension
    cmd = [
        settings.soffice_bin,
        "--headless",
        "--norestore",
        "--nodefault",
        "--nolockcheck",
        "--nofirststartwizard",
        "--convert-to",
        "pdf:writer_pdf_Export",
        "--outdir",
        str(output_dir),
        str(input_path),
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=max(5, settings.convert_timeout_seconds),
        )
    except subprocess.TimeoutExpired:
        raise ConversionError("Conversion timed out")

    if result.returncode != 0:
        stderr = (result.stderr or "").strip()
        stdout = (result.stdout or "").strip()
        raise ConversionError(f"LibreOffice failed (code {result.returncode}). stdout={stdout} stderr={stderr}")

    pdf_path = output_dir / (input_path.stem + ".pdf")
    if not pdf_path.exists():
        raise ConversionError("Expected PDF not produced by LibreOffice")

    return pdf_path
