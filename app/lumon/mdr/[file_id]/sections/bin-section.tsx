"use client";

import { Bin } from "@/app/lumon/mdr/[file_id]/components/bin";
import { useRefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function BinSection() {
  const refinementManager = useRefinementManager();

  return (
    <div className="relative h-32 w-screen flex justify-center">
      <ScrollArea className="h-full w-max max-w-full">
        <div className="h-32 w-max flex items-center gap-x-8 px-8">
          {refinementManager.bins.map((bin) => (
            <Bin
              key={bin.binId}
              bin={bin}
              onClick={() =>
                refinementManager.numberManager.assignHighlightedNumbersToBin(
                  bin
                )
              }
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
