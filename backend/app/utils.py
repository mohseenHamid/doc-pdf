import hashlib
import os
import shutil
import tempfile
from pathlib import Path
from typing import BinaryIO

import filetype


MAX_READ_CHUNK = 1024 * 1024  # 1MB


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def secure_delete(path: Path) -> None:
    try:
        if path.is_file():
            try:
                length = path.stat().st_size
                with open(path, "r+b", buffering=0) as f:
                    f.write(b"\x00" * min(length, 1024 * 1024))
            except Exception:
                pass
            path.unlink(missing_ok=True)
        elif path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
    except Exception:
        pass


def new_request_tmpdir(base: Path | None = None) -> Path:
    base = base or Path(tempfile.gettempdir())
    ensure_dir(base)
    return Path(tempfile.mkdtemp(prefix="conv_", dir=str(base)))


def write_stream_to_file(stream: BinaryIO, dest: Path, max_bytes: int) -> int:
    total = 0
    with open(dest, "wb") as out:
        while True:
            chunk = stream.read(min(MAX_READ_CHUNK, max_bytes - total))
            if not chunk:
                break
            out.write(chunk)
            total += len(chunk)
            if total > max_bytes:
                raise ValueError("File too large")
    return total


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def guess_mime_from_path(path: Path) -> str | None:
    try:
        kind = filetype.guess(str(path))
        return kind.mime if kind else None
    except Exception:
        return None


def has_allowed_extension(filename: str, allowed: set[str]) -> bool:
    ext = Path(filename).suffix.lower().lstrip(".")
    return ext in allowed
