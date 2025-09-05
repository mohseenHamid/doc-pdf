"use client";
import React, { useRef, useState } from "react";
import { useUploadStore } from "@/lib/UploadContext";
import Dropzone from "@/components/Dropzone";

export default function UploadForm({ onUploaded }: { onUploaded?: (id: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const store = useUploadStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = selected || inputRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a .doc or .docx file.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Conversion failed (status ${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const id = store.add({ name: file.name.replace(/\.(docx?|DOCX?)$/, ".pdf"), size: blob.size, createdAt: Date.now(), blob, url });
      onUploaded?.(id);
      if (inputRef.current) inputRef.current.value = "";
      setSelected(null);
    } catch (err: any) {
      setError(err?.message || "Conversion failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Dropzone
        onFileSelected={(f) => setSelected(f)}
        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => setSelected(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          disabled={uploading}
        >
          Browse files
        </button>

        <button
          type="submit"
          disabled={uploading || !selected}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          {uploading ? "Converting..." : "Convert to PDF"}
        </button>

        {selected && (
          <div className="ml-auto flex items-center gap-2 text-sm bg-gray-100 border border-gray-300 rounded-full pl-3 pr-2 py-1">
            <span className="text-gray-700 truncate max-w-[260px]" title={selected.name}>{selected.name}</span>
            <span className="text-gray-500">{formatBytes(selected.size)}</span>
            <button type="button" className="rounded-full bg-white border border-gray-300 px-2 py-0.5 text-gray-700 hover:bg-gray-50" onClick={() => setSelected(null)}>Clear</button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-700 text-sm">{error}</div>
      )}
    </form>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    bytes = bytes / 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(1)} ${units[i]}`;
}
