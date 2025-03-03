"use client";

import { LumonLink } from "@/app/components/lumon-link";
import { useRefinementManager } from "@/app/lumon/mdr/refinement-provider";
import { NumberCell } from "@/app/lumon/mdr/sections/refinement-section/components/number-cell";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export function NumberGrid() {
  const refinementManager = useRefinementManager();
  const { numberManager } = refinementManager;
  const containerRef = useRef<HTMLDivElement>(null);
  const { numbers } = numberManager.store();

  // When window resizes, recalculate the grid container size,
  // and uses this to re-populate the number cells in the grid.
  useEffect(() => {
    // First mount, generate the numbers.
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    numberManager.generateNumbers({ w: width, h: height });

    const handleWindowResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      numberManager.generateNumbers({ w: width, h: height });
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [numberManager]);

  return (
    <div
      id="number_grid"
      ref={containerRef}
      className="relative w-full h-full overflow-hidden py-[5px]"
    >
      {numbers.length === 0 ? (
        <div className="flex items-center justify-center h-full w-full">
          <LumonLink disabled />
        </div>
      ) : (
        numbers.map((number) => (
          <NumberCell key={number.id} cellId={number.id} />
        ))
      )}

      {/* Graident blur for the edges of the grid */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none h-full w-full z-50",
          "shadow-[inset_0_0_40px_20px_rgba(0,0,0,0.8)]",
          "backdrop-blur-[10px]"
        )}
        style={{
          maskImage:
            "radial-gradient(circle,transparent,transparent,transparent,transparent,transparent,black)",
        }}
      />
    </div>
  );
}
