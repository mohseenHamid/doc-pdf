import shutil
import subprocess
from pathlib import Path
from .config import settings


class SanitizeError(Exception):
    pass


def _qpdf_available() -> bool:
    return shutil.which("qpdf") is not None


def _gs_available() -> bool:
    # Ghostscript command name varies; try common ones
    for exe in ("gs", "gswin64c", "gswin32c"):
        if shutil.which(exe):
            return True
    return False


def sanitize_pdf(pdf_path: Path) -> Path:
    """Optionally sanitize a PDF. Returns path to sanitized PDF (may be same path).
    Prefers qpdf; falls back to Ghostscript if available. Raises SanitizeError on failure when enabled.
    """
    if not settings.enable_pdf_sanitize:
        return pdf_path

    tmp_out = pdf_path.with_suffix(".sanitized.pdf")

    if _qpdf_available():
        result = subprocess.run([
            "qpdf", "--no-warn", "--linearize", "--stream-data=compress",
            "--"
            , str(pdf_path), str(tmp_out)
        ], capture_output=True, text=True)
        if result.returncode != 0:
            raise SanitizeError(f"qpdf sanitize failed: code {result.returncode}")
        tmp_out.replace(pdf_path)
        return pdf_path

    # Ghostscript sanitize
    if _gs_available():
        gs = shutil.which("gs") or shutil.which("gswin64c") or shutil.which("gswin32c")
        result = subprocess.run([
            gs, "-dBATCH", "-dNOPAUSE", "-dSAFER", "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.7", "-dDetectDuplicateImages",
            "-dCompressFonts=true", "-sOutputFile=" + str(tmp_out), str(pdf_path)
        ], capture_output=True, text=True)
        if result.returncode != 0:
            raise SanitizeError(f"Ghostscript sanitize failed: code {result.returncode}")
        tmp_out.replace(pdf_path)
        return pdf_path

    # Sanitization requested but no tool available
    raise SanitizeError("PDF sanitization enabled but neither qpdf nor Ghostscript is available")
