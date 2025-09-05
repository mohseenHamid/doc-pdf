"use client";
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="w-full border-b border-gray-800 bg-[#0b0c0c]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/upload" className="font-semibold text-gray-100 hover:text-white">
          e‑RS Conversion (PoC)
        </Link>
        <div className="ml-auto flex items-center gap-5 text-sm">
          <Link href="/upload" className="text-gray-300 hover:text-white transition-colors">Upload</Link>
          <Link href="/files" className="text-gray-300 hover:text-white transition-colors">Files</Link>
        </div>
      </div>
    </nav>
  );
}
