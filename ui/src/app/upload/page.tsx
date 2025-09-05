"use client";
import React, { useState } from "react";
import UploadForm from "@/components/UploadForm";
import FilesTable from "@/components/FilesTable";
import PdfPreviewOverlay from "@/components/PdfPreviewOverlay";
import { useUploadStore } from "@/lib/UploadContext";

export default function UploadPage() {
    const store = useUploadStore();
    const [previewId, setPreviewId] = useState<string | null>(null);

    const current = previewId ? store.find(previewId) : undefined;

    return (
    <div className="space-y-6">
        <header>
            <h1 className="text-2xl font-semibold text-[#0b0c0c]">e‑RS Conversion (PoC)</h1>
            <p className="text-gray-700">Upload a .doc or .docx file to convert to PDF. Preview uses Chromium&#39;s native PDF viewer in an overlay.</p>
        </header>
        <section className="bg-white border border-gray-300 p-4 rounded">
            <h2 className="text-lg font-medium mb-3">Upload</h2>
            <UploadForm onUploaded={(id) => setPreviewId(id)} />
        </section>
        <section className="bg-white border border-gray-300 p-4 rounded">
            <h2 className="text-lg font-medium mb-3">Converted Files</h2>
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
