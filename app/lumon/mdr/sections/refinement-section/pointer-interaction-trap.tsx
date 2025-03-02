"use client";

import { RefinementManager } from "@/app/lumon/mdr/refinement-manager";
import { GRID_CONFIG } from "@/app/lumon/mdr/sections/refinement-section/grid-config";
import { compact } from "lodash";
import { useCallback } from "react";

export function PointerInteractionTrap() {
  const { numberManager } = RefinementManager.get();

  const handlePointerClick = useCallback(
    (clickEvent: React.MouseEvent<HTMLDivElement>) => {
      const clickX = clickEvent.clientX;
      const clickY = clickEvent.clientY;
      const numberGrid = document.getElementById("number_grid");
      if (!numberGrid) throw new Error("Number grid not found");
      const gridX = numberGrid.getBoundingClientRect().left;
      const gridY = numberGrid.getBoundingClientRect().top;
      const cellRow = Math.floor((clickY - gridY) / GRID_CONFIG.CELL_SIZE);
      const cellCol = Math.floor((clickX - gridX) / GRID_CONFIG.CELL_SIZE);
      // Get all valid cells around the center cell in the 3x3 grid
      const cells = compact(
        Array.from({ length: 3 }, (_, rowOffset) =>
          Array.from({ length: 3 }, (_, colOffset) => {
            const row = cellRow - 1 + rowOffset;
            const col = cellCol - 1 + colOffset;
            // Skip invalid positions (negative row or col)
            if (row < 0 || col < 0) return undefined;
            if (row > numberManager.maxRow || col > numberManager.maxCol)
              return undefined;
            return numberManager.getNumberForPosition(row, col);
          })
        ).flat()
      );

      // Highlight the cells
      numberManager.highlightNumbers(cells);
    },
    [numberManager]
  );

  return (
    <div
      className="absolute inset-0 w-full h-full z-[9999]"
      onClick={handlePointerClick}
    />
  );
}
