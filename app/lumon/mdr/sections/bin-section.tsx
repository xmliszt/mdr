"use client";

import { Bin } from "@/app/lumon/mdr/components/bin";
import { useRefinementManager } from "@/app/lumon/mdr/refinement-provider";

export function BinSection() {
  const refinementManager = useRefinementManager();

  return (
    <div className="h-32 px-4 w-full border flex justify-center items-center gap-x-12">
      {refinementManager.bins.map((bin) => (
        <Bin
          key={bin.binId}
          bin={bin}
          onClick={() =>
            refinementManager.numberManager.assignHighlightedNumbersToBin(bin)
          }
        />
      ))}
    </div>
  );
}
