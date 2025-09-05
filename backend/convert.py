#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from dotenv import load_dotenv

from app.config import settings
from app.av import scan_path, AVScanError
from app.converter import convert_to_pdf, ConversionError
from app.sanitize import sanitize_pdf, SanitizeError


def main():
    load_dotenv()

    parser = argparse.ArgumentParser(description="Convert DOC/DOCX to PDF using LibreOffice headless")
    parser.add_argument("input", type=Path, help="Path to input .doc or .docx")
    parser.add_argument("-o", "--output", type=Path, help="Path to output PDF (optional)")
    args = parser.parse_args()

    input_path: Path = args.input
    if not input_path.exists():
        print(f"Input not found: {input_path}", file=sys.stderr)
        return 2

    # Create output path
    if args.output:
        output_path = args.output
        output_dir = output_path.parent
    else:
        output_dir = input_path.parent
        output_path = output_dir / (input_path.stem + ".pdf")

    output_dir.mkdir(parents=True, exist_ok=True)

    # AV scan (if enabled)
    try:
        scan_path(input_path)
    except AVScanError as e:
        print(f"AV scan failed: {e}", file=sys.stderr)
        return 3

    # Convert
    try:
        tmp_pdf = convert_to_pdf(input_path, output_dir)
    except ConversionError as e:
        print(f"Conversion failed: {e}", file=sys.stderr)
        return 4

    # Sanitize (optional)
    try:
        sanitized = sanitize_pdf(tmp_pdf)
    except SanitizeError as e:
        print(f"Sanitize failed: {e}", file=sys.stderr)
        return 5

    # Move/rename if necessary
    if sanitized != output_path:
        sanitized.replace(output_path)

    print(str(output_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
