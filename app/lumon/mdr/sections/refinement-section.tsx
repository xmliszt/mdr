"use client";

import { Button } from "@/components/ui/button";
import { RefinementManager } from "../refinement-manager";

export function RefinementSection() {
  return (
    <div className="relative flex-1 w-full flex items-center justify-center">
      <Button
        onClick={() => {
          RefinementManager.get()
            .getBinByIndex(0)
            ?.store.setState((current) => ({
              wo: current.wo + 0.05,
              fc: current.fc + 0.05,
              dr: current.dr + 0.05,
              ma: current.ma + 0.05,
            }));
        }}
      >
        Refine
      </Button>
      <div className="absolute top-0 w-full flex flex-col gap-y-[3px] h-[4px]">
        <div className="bg-accent-foreground h-[1px] w-full" />
        <div className="bg-accent-foreground h-[1px] w-full" />
      </div>
      <div className="absolute bottom-0 w-full flex flex-col gap-y-[3px] h-[4px]">
        <div className="bg-accent-foreground h-[1px] w-full" />
        <div className="bg-accent-foreground h-[1px] w-full" />
      </div>
    </div>
  );
}
