"use client";

import { LumonLink } from "@/app/components/lumon-link";
import { useRefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import { NumberCell } from "@/app/lumon/mdr/[file_id]/sections/refinement-section/components/number-cell";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

export function NumberGrid() {
  const refinementManager = useRefinementManager();
  const { numberManager } = refinementManager;
  const containerRef = useRef<HTMLDivElement>(null);
  // Subscribe to both numbers and viewport to ensure re-render when either changes
  const { numbers } = numberManager.store();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When window resizes, recalculate the grid container size,
  // and uses this to re-populate the number cells in the grid.
  useEffect(() => {
    // First mount, generate the numbers.
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    numberManager.generateNumbers({ w: width, h: height });

    // Focus the grid container to enable keyboard navigation
    containerRef.current.focus();

    const handleWindowResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      numberManager.generateNumbers({ w: width, h: height });
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [numberManager]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isArrowKey = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.key);

      if (isArrowKey) {
        // Show navigation feedback
        setIsNavigating(true);

        // Clear any existing timeout
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }

        // Set a timeout to hide the navigation feedback
        navigationTimeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
          navigationTimeoutRef.current = null;
        }, 300);
      }

      switch (e.key) {
        case "ArrowUp":
          numberManager.moveViewport("up");
          break;
        case "ArrowDown":
          numberManager.moveViewport("down");
          break;
        case "ArrowLeft":
          numberManager.moveViewport("left");
          break;
        case "ArrowRight":
          numberManager.moveViewport("right");
          break;
      }
    },
    [numberManager]
  );

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Clear any navigation timeout on unmount
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  return (
    <div
      id="number_grid"
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden py-[5px] outline-none",
        isNavigating && "transition-all duration-300 ease-out"
      )}
      tabIndex={0} // Make the div focusable to receive keyboard events
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

      {/* Navigation indicator - subtle visual feedback when navigating */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none z-40 border-8 border-white/20 shadow-inner shadow-white/10 transition-opacity",
          isNavigating ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
