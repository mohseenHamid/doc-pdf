"use client";
import React, { useEffect } from "react";

type Props = {
  open: boolean;
  title?: string;
  src: string | null;
  onClose: () => void;
};

export default function PdfPreviewOverlay({ open, title, src, onClose }: Props) {
  useEffect(() => {
    return () => {
      // caller is responsible for URL.revokeObjectURL, but keep hook for future cleanup
    };
  }, []);

  if (!open || !src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 flex flex-col"
    >
      <div className="flex items-center justify-between p-3 bg-[#0b0c0c] text-white">
        <div className="font-semibold truncate">{title || "Preview"}</div>
        <button
          onClick={onClose}
          className="rounded px-3 py-1 bg-white text-black hover:bg-gray-200"
          aria-label="Close preview"
        >
          Close
        </button>
      </div>
      <div className="flex-1 bg-gray-100">
        <iframe
          title={title || "PDF Preview"}
          src={src}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
