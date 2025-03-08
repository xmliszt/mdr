"use client";

import { useRefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import { GRID_CONFIG } from "@/app/lumon/mdr/[file_id]/sections/refinement-section/grid-config";
import { compact, throttle } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";

export function PointerInteractionTrap() {
  const refinementManager = useRefinementManager();
  const { numberManager, pointerManager } = refinementManager;
  const [touchStartPosition, setTouchStartPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Update grid rect on mount and when window resizes
  useEffect(() => {
    const updateGridRect = () => {
      const numberGrid = document.getElementById("number_grid");
      if (numberGrid) {
        const rect = numberGrid.getBoundingClientRect();
        pointerManager.updateGridRect(rect);
      }
    };

    // Initial update
    updateGridRect();

    // Update on resize
    window.addEventListener("resize", updateGridRect);
    return () => {
      window.removeEventListener("resize", updateGridRect);
    };
  }, [pointerManager]);

  const highlightCellsInRadius = useCallback(
    (options: { pointerX: number; pointerY: number }) => {
      const gridRect = pointerManager.store.getState().gridRect;
      if (!gridRect) return;

      const gridX = gridRect.left;
      const gridY = gridRect.top;

      // Calculate the center cell in relative coordinates
      const relativeRow = Math.floor(
        (options.pointerY - gridY) / GRID_CONFIG.CELL_SIZE
      );
      const relativeCol = Math.floor(
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
    [numberManager, pointerManager]
  );

  // Handle mouse move to update pointer position
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Update the pointer position in the store
      pointerManager.updatePointerPosition(e.clientX, e.clientY);
    },
    [pointerManager]
  );

  // Use useMemo to create a stable throttled function
  const throttledMouseMove = useMemo(
    () => throttle(handleMouseMove, 16), // ~60fps
    [handleMouseMove]
  );

  // Clean up the throttled function on unmount
  useEffect(() => {
    return () => throttledMouseMove.cancel();
  }, [throttledMouseMove]);

  const handleOnClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) =>
      highlightCellsInRadius({ pointerX: e.clientX, pointerY: e.clientY }),
    [highlightCellsInRadius]
  );

  // Handle touch start for swipe detection
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 1) {
        setTouchStartPosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    },
    []
  );

  // Handle touch end for swipe detection
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!touchStartPosition) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartPosition.x;
      const deltaY = touchEndY - touchStartPosition.y;

      // Minimum distance to be considered a swipe
      const minSwipeDistance = 50;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            numberManager.moveViewport("left");
          } else {
            numberManager.moveViewport("right");
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            numberManager.moveViewport("down");
          } else {
            numberManager.moveViewport("up");
          }
        }
      }

      setTouchStartPosition(null);
    },
    [touchStartPosition, numberManager]
  );

  // Handle touch move for updating pointer position
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        pointerManager.updatePointerPosition(touch.clientX, touch.clientY);
      }
    },
    [pointerManager]
  );

  // Create throttled touch move handler
  const throttledTouchMove = useMemo(
    () => throttle(handleTouchMove, 16), // ~60fps
    [handleTouchMove]
  );

  // Clean up the throttled touch move function on unmount
  useEffect(() => {
    return () => throttledTouchMove.cancel();
  }, [throttledTouchMove]);

  return (
    <div
      className="absolute inset-0 w-full h-full z-[9999] opacity-0"
      onClick={handleOnClick}
      onMouseMove={throttledMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={throttledTouchMove}
    />
  );
}
