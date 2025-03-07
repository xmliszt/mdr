"use client";

import { RefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-manager";
import { createContext, useContext, useEffect, useState } from "react";

const RefinementContext = createContext<RefinementManager | null>(null);

type RefinementProviderProps = {
  children: React.ReactNode;
  fileId: string;
};

export function RefinementProvider(props: RefinementProviderProps) {
  const [refinementManager, setRefinementManager] =
    useState<RefinementManager | null>(null);

  useEffect(() => {
    const refinementManager = new RefinementManager({ fileId: props.fileId });
    setRefinementManager(refinementManager);
    return () => refinementManager.unmount();
  }, [props.fileId]);

  if (!refinementManager) return null;

  return (
    <RefinementContext.Provider value={refinementManager}>
      {props.children}
    </RefinementContext.Provider>
  );
}

export function useRefinementManager() {
  const refinementManager = useContext(RefinementContext);
  if (!refinementManager) throw new Error("RefinementManager not initialized");
  return refinementManager;
}
