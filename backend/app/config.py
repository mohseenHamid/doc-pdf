import os
from dataclasses import dataclass
from dotenv import load_dotenv

"""
Ensure that environment variables from a local .env file are loaded
BEFORE we construct the Settings instance. This fixes issues where
downstream modules import `settings` before calling load_dotenv(),
causing defaults to override .env values (e.g., ENABLE_AV_SCAN=false).
"""
load_dotenv()


def _get_bool(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return str(val).strip().lower() in {"1", "true", "yes", "y", "on"}


def _get_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except Exception:
        return default


@dataclass
class Settings:
    enable_av_scan: bool = _get_bool("ENABLE_AV_SCAN", True)
    enable_pdf_sanitize: bool = _get_bool("ENABLE_PDF_SANITIZE", False)
    max_upload_mb: int = _get_int("MAX_UPLOAD_MB", 20)
    convert_timeout_seconds: int = _get_int("CONVERT_TIMEOUT_SECONDS", 120)
    allowed_extensions: set[str] = None  # type: ignore
    soffice_bin: str = os.getenv("SOFFICE_BIN", "soffice")
    defender_exe: str | None = os.getenv("DEFENDER_EXE") or None
    clamscan_bin: str = os.getenv("CLAMSCAN_BIN", "clamscan")

    def __post_init__(self):
        if self.allowed_extensions is None:
            exts = os.getenv("ALLOWED_EXTENSIONS", "doc,docx")
            self.allowed_extensions = {e.strip().lower() for e in exts.split(",") if e.strip()}


settings = Settings()
