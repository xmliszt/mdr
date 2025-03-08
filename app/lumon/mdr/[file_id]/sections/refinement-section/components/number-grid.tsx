"use client";

import { LumonLink } from "@/app/components/lumon-link";
import { useRefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import { NumberCell } from "@/app/lumon/mdr/[file_id]/sections/refinement-section/components/number-cell";
import { GRID_CONFIG } from "@/app/lumon/mdr/[file_id]/sections/refinement-section/grid-config";
import { cn } from "@/lib/utils";
import { compact } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export function NumberGrid() {
  const refinementManager = useRefinementManager();
  const { numberManager, pointerManager } = refinementManager;
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

  // Function to update pointer position to center of viewport
  const updatePointerToViewportCenter = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    pointerManager.updatePointerPosition(centerX, centerY);
  }, [pointerManager]);

  // Function to trigger highlighting at current pointer position
  const triggerHighlightAtPointer = useCallback(() => {
    const { x, y } = pointerManager.store.getState();

    // Find all cells within the highlight radius and highlight them
    const gridRect = pointerManager.store.getState().gridRect;
    if (!gridRect) return;

    const gridX = gridRect.left;
    const gridY = gridRect.top;

    // Calculate the center cell in relative coordinates
    const relativeRow = Math.floor((y - gridY) / GRID_CONFIG.CELL_SIZE);
    const relativeCol = Math.floor((x - gridX) / GRID_CONFIG.CELL_SIZE);

    // Calculate the radius in terms of cells
    const radiusCells = Math.ceil(
      GRID_CONFIG.POINTER_INFLUENCE_RADIUS / GRID_CONFIG.CELL_SIZE
    );

    // Get all cells within the radius
    const cellsInRadius = compact(
      Array.from({ length: radiusCells * 2 + 1 }, (_, rowOffset) =>
        Array.from({ length: radiusCells * 2 + 1 }, (_, colOffset) => {
          const row = relativeRow - radiusCells + rowOffset;
          const col = relativeCol - radiusCells + colOffset;

          // Skip invalid positions (only check relative bounds)
          if (row < 0 || col < 0) return undefined;
          if (
            row > numberManager.maxRelativeRow ||
            col > numberManager.maxRelativeCol
          )
            return undefined;

          try {
            const cell = numberManager.getNumberForRelativePosition(row, col);

            // Calculate the cell's center position
            const cellCenterX = gridX + (col + 0.5) * GRID_CONFIG.CELL_SIZE;
            const cellCenterY = gridY + (row + 0.5) * GRID_CONFIG.CELL_SIZE;

            // Calculate distance from pointer to cell center
            const distance = Math.sqrt(
              Math.pow(x - cellCenterX, 2) + Math.pow(y - cellCenterY, 2)
            );

            // Only include cells within the influence radius
            return distance <= GRID_CONFIG.POINTER_INFLUENCE_RADIUS
              ? cell
              : undefined;
          } catch {
            return undefined;
          }
        })
      ).flat()
    );

    // Highlight the cells that are not already highlighted
    numberManager.highlightNumbers(cellsInRadius);
  }, [numberManager, pointerManager]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isArrowKey = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.key);

      const isActionKey = e.key === " " || e.key === "Enter";

      const isBinNumberKey = ["1", "2", "3", "4", "5"].includes(e.key);

      if (!isArrowKey && !isActionKey && !isBinNumberKey) return;

      // Prevent default behavior for these keys
      e.preventDefault();

      if (isActionKey) {
        // Trigger highlighting at current pointer position
        triggerHighlightAtPointer();
        return;
      }

      if (isBinNumberKey) {
        // Trigger put number at current pointer position
        const binLabel = e.key.padStart(2, "0");
        const bin = refinementManager.bins.find(
          (bin) => bin.binId === `bin_${binLabel}`
        );
        if (!bin) throw new Error(`Bin ${binLabel} not found`);
        refinementManager.numberManager.assignHighlightedNumbersToBin(bin);
        return;
      }

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

      // Update pointer position to center of viewport after navigation
      updatePointerToViewportCenter();
    },
    [
      updatePointerToViewportCenter,
      triggerHighlightAtPointer,
      refinementManager.bins,
      refinementManager.numberManager,
      numberManager,
    ]
  );

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Clear any navigation timeout on unmount
      if (!navigationTimeoutRef.current) return;
      clearTimeout(navigationTimeoutRef.current);
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
          "absolute inset-0 pointer-events-none h-full w-full",
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
          "absolute inset-0 pointer-events-none z-40 shadow-[inset_0_0_20px_0px_rgba(255,255,255,0.8)] transition-opacity",
          isNavigating ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
