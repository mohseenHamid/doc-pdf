import os
import shutil
import subprocess
from pathlib import Path
from .config import settings


class AVScanError(Exception):
    pass


def _defender_available() -> bool:
    exe = settings.defender_exe or "C\\Program Files\\Windows Defender\\MpCmdRun.exe"
    return Path(exe).exists()


def _clamscan_available() -> bool:
    exe = settings.clamscan_bin
    return shutil.which(exe) is not None


def scan_path(path: Path) -> None:
    """Scan file using AV if enabled. Raises AVScanError on detection or failures when enabled.
    If AV disabled, returns immediately.
    """
    if not settings.enable_av_scan:
        return

    # Prefer Windows Defender on Windows hosts
    if os.name == "nt" and _defender_available():
        exe = settings.defender_exe or "C\\Program Files\\Windows Defender\\MpCmdRun.exe"
        # MpCmdRun returns 0 (no threats), 2 (threats found), others for errors
        result = subprocess.run(
            [exe, "-Scan", "-ScanType", "3", "-File", str(path)],
            capture_output=True,
            text=True,
        )
        if result.returncode == 2:
            raise AVScanError("Windows Defender detected a threat in the uploaded file")
        if result.returncode not in (0,):
            raise AVScanError(f"Windows Defender scan failed: code {result.returncode}")
        return

    # Fallback to ClamAV if available
    if _clamscan_available():
        exe = settings.clamscan_bin
        result = subprocess.run(
            [exe, "--no-summary", str(path)],
            capture_output=True,
            text=True,
        )
        if result.returncode == 1:
            raise AVScanError("ClamAV detected a threat in the uploaded file")
        if result.returncode not in (0,):
            raise AVScanError(f"ClamAV scan failed: code {result.returncode}")
        return

    # If AV is enabled but no scanner present, fail securely
    raise AVScanError("AV scanning is enabled but no scanner is available. Configure DEFENDER_EXE or install clamscan, or set ENABLE_AV_SCAN=false for PoC.")
