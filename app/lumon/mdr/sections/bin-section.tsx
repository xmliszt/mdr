"use client";

import { Bin } from "../components/bin";
import { RefinementManager } from "../refinement-manager";

export function BinSection() {
  return (
    <div className="h-32 px-4 w-full border flex justify-center items-center gap-x-12">
      {RefinementManager.get().bins.map((bin) => (
        <Bin key={bin.label} bin={bin} />
      ))}
    </div>
  );
}
