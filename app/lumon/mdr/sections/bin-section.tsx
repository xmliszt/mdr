"use client";

import { Bin } from "@/app/lumon/mdr/components/bin";
import { RefinementManager } from "@/app/lumon/mdr/refinement-manager";

export function BinSection() {
  const { numberManager } = RefinementManager.get();

  return (
    <div className="h-32 px-4 w-full border flex justify-center items-center gap-x-12">
      {RefinementManager.get().bins.map((bin) => (
        <Bin
          key={bin.binId}
          bin={bin}
          onClick={() => numberManager.assignHighlightedNumbersToBin(bin)}
        />
      ))}
    </div>
  );
}
