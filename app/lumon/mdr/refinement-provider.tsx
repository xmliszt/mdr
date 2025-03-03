"use client";

import { RefinementManager } from "@/app/lumon/mdr/refinement-manager";
import { createContext, useContext, useEffect, useState } from "react";

const RefinementContext = createContext<RefinementManager | null>(null);

export function RefinementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refinementManager, setRefinementManager] =
    useState<RefinementManager | null>(null);

  useEffect(() => {
    const refinementManager = new RefinementManager();
    setRefinementManager(refinementManager);
    return () => refinementManager.unmount();
  }, []);

  if (!refinementManager) return null;

  return (
    <RefinementContext.Provider value={refinementManager}>
      {children}
    </RefinementContext.Provider>
  );
}

export function useRefinementManager() {
  const refinementManager = useContext(RefinementContext);
  if (!refinementManager) throw new Error("RefinementManager not initialized");
  return refinementManager;
}
