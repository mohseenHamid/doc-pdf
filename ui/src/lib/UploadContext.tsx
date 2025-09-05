"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import type { ConvertedItem } from "@/lib/uploadStore";

export type UploadStore = {
  items: ConvertedItem[];
  add: (item: Omit<ConvertedItem, "id">) => string; // returns new id
  remove: (id: string) => void;
  clear: () => void;
  find: (id: string) => ConvertedItem | undefined;
};

const UploadContext = createContext<UploadStore | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ConvertedItem[]>([]);

  const add = useCallback((item: Omit<ConvertedItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const record: ConvertedItem = { id, ...item };
    setItems((prev) => [record, ...prev]);
    return id;
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setItems((prev) => {
      for (const i of prev) URL.revokeObjectURL(i.url);
      return [];
    });
  }, []);

  const find = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const value: UploadStore = { items, add, remove, clear, find };

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
}

export function useUploadStore() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploadStore must be used within UploadProvider");
  return ctx;
}
