"use client";
import React, { createContext, useContext, useMemo } from "react";
import { createUploadStore, type UploadStore } from "@/lib/uploadStore";

const UploadContext = createContext<UploadStore | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => createUploadStore(), []);
  return <UploadContext.Provider value={store}>{children}</UploadContext.Provider>;
}

export function useUploadStore() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploadStore must be used within UploadProvider");
  return ctx;
}
