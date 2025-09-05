# DOC/DOCX → PDF Converter (PoC)

Secure PoC backend using FastAPI + LibreOffice (headless) to convert `.doc`/`.docx` to PDF/A, with optional AV scan and PDF sanitization.

## Features
- Accepts `.doc` and `.docx` (blocks `.docm` and other types)
- Size/time limits, MIME+magic checks
- AV integration: Windows Defender (Windows) or ClamAV (Linux)
- LibreOffice headless conversion to PDF (PDF/A-2b)
- Optional PDF sanitization with `qpdf`/Ghostscript
- No persistence: per-request temp dir, immediate secure delete
- Structured logs without PII

## Requirements
- Python 3.11+
- LibreOffice installed and `soffice` in PATH
  - Windows: install LibreOffice and ensure `soffice.exe` is on PATH or set `SOFFICE_BIN`
- (Optional) AV tools
  - Windows: Microsoft Defender `MpCmdRun.exe`
  - Linux: `clamscan` (ClamAV)
- (Optional) `qpdf` or Ghostscript for sanitization

## Setup
```bash
python -m venv convert-env
source convert-env/bin/activate  # Windows: convert-env\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env as needed (SOFFICE_BIN, ENABLE_AV_SCAN, limits, etc.)
```

## Run the API
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

Health check
```bash
curl http://localhost:8080/healthz
```

Convert (HTTP)
```bash
curl -f -X POST http://localhost:8080/convert \
  -H "Expect:" \
  -F "file=@/path/to/input.docx" \
  -o output.pdf
```

## CLI usage
```bash
python convert.py /path/to/input.docx -o /path/to/output.pdf
```

## Notes on security (PoC defaults)
- AV scanning is enabled by default; disable via `ENABLE_AV_SCAN=false` if needed for first run
- Upload size limit defaults to `MAX_UPLOAD_MB=20`
- Conversion timeout defaults to `CONVERT_TIMEOUT_SECONDS=120`
- Sanitization is disabled by default; enable with `ENABLE_PDF_SANITIZE=true` if `qpdf`/Ghostscript present

## Windows specifics
- Ensure LibreOffice is installed. Example binary paths:
  - `C:\\Program Files\\LibreOffice\\program\\soffice.exe`
- To set explicitly: `SOFFICE_BIN=C:\\Program Files\\LibreOffice\\program\\soffice.exe`
- Windows Defender path commonly:
  - `C:\\Program Files\\Windows Defender\\MpCmdRun.exe`
  - Set `DEFENDER_EXE` if different.

## Linux Docker (optional)
A simple Dockerfile (hardened) can be added for Linux deployment with LibreOffice, ClamAV, and qpdf.

## Roadmap
- Add PDF/A export profile tuning
- Add page count and font report
- Angular UI (file upload, Chromium-native PDF preview overlay, download)
