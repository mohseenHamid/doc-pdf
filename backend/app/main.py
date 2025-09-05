from __future__ import annotations

import os
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .config import settings
from .utils import new_request_tmpdir, write_stream_to_file, has_allowed_extension, guess_mime_from_path, secure_delete, sha256_file
from .av import scan_path, AVScanError
from .converter import convert_to_pdf, ConversionError
from .sanitize import sanitize_pdf, SanitizeError

load_dotenv()

app = FastAPI(title="DOC/DOCX to PDF Converter", version="0.1.0")

# CORS can be configured as needed; for PoC allow localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/convert")
async def convert(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    filename = file.filename or "upload"
    if not has_allowed_extension(filename, settings.allowed_extensions):
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: .doc, .docx")

    tmpdir = new_request_tmpdir()
    input_path = tmpdir / filename
    try:
        # Write body with size limit
        max_bytes = settings.max_upload_mb * 1024 * 1024
        # Starlette UploadFile provides a SpooledTemporaryFile; read in chunks
        bytes_written = write_stream_to_file(file.file, input_path, max_bytes)

        # Basic magic/mime guess (best-effort)
        mime = guess_mime_from_path(input_path) or "application/octet-stream"

        # AV scan (optional but enabled by default)
        try:
            scan_path(input_path)
        except AVScanError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Convert to PDF
        try:
            pdf_path = convert_to_pdf(input_path, tmpdir)
        except ConversionError as e:
            raise HTTPException(status_code=500, detail=str(e))

        # Optional sanitize
        try:
            pdf_path = sanitize_pdf(pdf_path)
        except SanitizeError as e:
            raise HTTPException(status_code=500, detail=str(e))

        # Hash for audit (do not log content)
        in_hash = sha256_file(input_path)
        out_hash = sha256_file(pdf_path)
        # Minimal structured log to stdout (infra can collect)
        print({
            "event": "convert",
            "in_bytes": bytes_written,
            "in_hash": in_hash,
            "out_hash": out_hash,
            "engine": "libreoffice",
            "sanitize": settings.enable_pdf_sanitize,
        })

        headers = {
            # Security headers for file download; UI may choose inline display
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'",
        }
        # Schedule cleanup of the temp directory AFTER the response is sent
        if background_tasks is not None:
            background_tasks.add_task(secure_delete, tmpdir)

        return FileResponse(
            path=str(pdf_path),
            media_type="application/pdf",
            filename=Path(filename).stem + ".pdf",
            headers=headers,
        )
    except Exception:
        # On error, cleanup immediately before propagating
        secure_delete(tmpdir)
        raise


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    # Avoid leaking internals; generic 500
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
