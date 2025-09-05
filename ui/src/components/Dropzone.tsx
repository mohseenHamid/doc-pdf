"use client";
import React, { useCallback, useRef, useState } from "react";

type Props = {
  onFileSelected: (file: File) => void;
  accept?: string;
};

export default function Dropzone({ onFileSelected, accept }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }, [onFileSelected]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg px-6 py-10 text-center transition-colors cursor-pointer ${isDragging ? "border-[var(--nhs-blue)] bg-[#0d1b2a]" : "border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[#121b27]"}`}
      onClick={() => inputRef.current?.click()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 000-8h-.26A8 8 0 103 15zm7-4l2-2m0 0l2 2m-2-2v6" />
      </svg>
      <p className="text-gray-200"><span className="font-medium text-[var(--nhs-blue-bright)]">Drag and drop</span> a .doc/.docx here, or click to browse</p>
      <p className="text-gray-400 text-sm mt-1">Only .doc and .docx files are supported</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelected(f);
        }}
      />
    </div>
  );
}
