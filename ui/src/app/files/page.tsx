"use client";
import React, { useState } from "react";
import FilesTable from "@/components/FilesTable";
import PdfPreviewOverlay from "@/components/PdfPreviewOverlay";
import { useUploadStore } from "@/lib/UploadContext";

export default function FilesPage() {
  const store = useUploadStore();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const current = previewId ? store.find(previewId) : undefined;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#0b0c0c]">Converted Files</h1>
        <p className="text-gray-700">Preview or download converted PDFs from this session.</p>
      </header>
      <section className="bg-white border border-gray-300 p-4 rounded">
        <FilesTable onPreview={(id) => setPreviewId(id)} onRemove={(id) => store.remove(id)} />
      </section>

      <PdfPreviewOverlay
        open={!!current}
        title={current?.name}
        src={current?.url ?? null}
        onClose={() => setPreviewId(null)}
      />
    </div>
  );
}
