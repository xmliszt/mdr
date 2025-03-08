"use client";

import { Bin } from "@/app/lumon/mdr/[file_id]/components/bin";
import { useRefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-provider";

export function BinSection() {
  const refinementManager = useRefinementManager();

  return (
    <div className="relative h-32 w-screen flex">
      <div className="h-32 flex items-center justify-center w-full gap-x-8 px-8">
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
    </div>
  );
}
