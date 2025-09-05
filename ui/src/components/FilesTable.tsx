"use client";
import React from "react";
import { useUploadStore } from "@/lib/UploadContext";

export type TableActions = {
  onPreview: (id: string) => void;
  onRemove?: (id: string) => void;
};

export default function FilesTable({ onPreview, onRemove }: TableActions) {
  const store = useUploadStore();

  if (!store.items.length) {
    return <div className="text-gray-400">No converted files yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-800 bg-[#0f1115] text-gray-100">
        <thead className="bg-[#111319]">
          <tr>
            <th className="px-3 py-2 text-left border-b border-gray-800">Name</th>
            <th className="px-3 py-2 text-left border-b border-gray-800">Size</th>
            <th className="px-3 py-2 text-left border-b border-gray-800">Created</th>
            <th className="px-3 py-2 text-left border-b border-gray-800">Actions</th>
          </tr>
        </thead>
        <tbody>
          {store.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-800">
              <td className="px-3 py-2 text-gray-200">{item.name}</td>
              <td className="px-3 py-2 text-gray-300">{formatBytes(item.size)}</td>
              <td className="px-3 py-2 text-gray-300">{new Date(item.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 flex gap-2">
                <button
                  onClick={() => onPreview(item.id)}
                  className="rounded px-3 py-1 bg-blue-500 text-white hover:bg-blue-600"
                >
                  Preview
                </button>
                <a
                  href={item.url}
                  download={item.name}
                  className="rounded px-3 py-1 bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Download
                </a>
                {onRemove && (
                  <button
                    onClick={() => onRemove(item.id)}
                    className="rounded px-3 py-1 bg-gray-800 text-gray-200 hover:bg-gray-700"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
