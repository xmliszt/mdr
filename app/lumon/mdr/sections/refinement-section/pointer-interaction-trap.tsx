"use client";

import { RefinementManager } from "@/app/lumon/mdr/refinement-manager";
import { GRID_CONFIG } from "@/app/lumon/mdr/sections/refinement-section/grid-config";
import { compact } from "lodash";
import { useCallback } from "react";

export function PointerInteractionTrap() {
  const { numberManager } = RefinementManager.get();

  const highlightCellsInRadius = useCallback(
    (options: { pointerX: number; pointerY: number }) => {
      const numberGrid = document.getElementById("number_grid");
      if (!numberGrid) return;

      const gridRect = numberGrid.getBoundingClientRect();
      const gridX = gridRect.left;
      const gridY = gridRect.top;

      // Calculate the center cell
      const centerCellRow = Math.floor(
        (options.pointerY - gridY) / GRID_CONFIG.CELL_SIZE
      );
      const centerCellCol = Math.floor(
        (options.pointerX - gridX) / GRID_CONFIG.CELL_SIZE
      );

      // Calculate the radius in terms of cells
      const radiusCells = Math.ceil(
        GRID_CONFIG.POINTER_INFLUENCE_RADIUS / GRID_CONFIG.CELL_SIZE
      );

      // Get all cells within the radius
      const cellsInRadius = compact(
        Array.from({ length: radiusCells * 2 + 1 }, (_, rowOffset) =>
          Array.from({ length: radiusCells * 2 + 1 }, (_, colOffset) => {
            const row = centerCellRow - radiusCells + rowOffset;
            const col = centerCellCol - radiusCells + colOffset;

            // Skip invalid positions
            if (row < 0 || col < 0) return undefined;
            if (row > numberManager.maxRow || col > numberManager.maxCol)
              return undefined;

            try {
              const cell = numberManager.getNumberForPosition(row, col);

              // Calculate the cell's center position
              const cellCenterX = gridX + (col + 0.5) * GRID_CONFIG.CELL_SIZE;
              const cellCenterY = gridY + (row + 0.5) * GRID_CONFIG.CELL_SIZE;

              // Calculate distance from pointer to cell center
              const distance = Math.sqrt(
                Math.pow(options.pointerX - cellCenterX, 2) +
                  Math.pow(options.pointerY - cellCenterY, 2)
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
    },
    [numberManager]
  );

  const handleOnClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) =>
      highlightCellsInRadius({ pointerX: e.clientX, pointerY: e.clientY }),
    [highlightCellsInRadius]
  );

  return (
    <div
      className="absolute inset-0 w-full h-full z-[9999]"
      onClick={handleOnClick}
    />
  );
}
