"use client";

import { useRefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-provider";
import { GRID_CONFIG } from "@/app/lumon/mdr/[file_id]/sections/refinement-section/grid-config";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

type NumberCellProps = {
  cellId: string;
};

export function NumberCell({ cellId }: NumberCellProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const refinementManager = useRefinementManager();
  const { numberManager, pointerManager } = refinementManager;
  const number = numberManager.getNumber(cellId);

  // Calculate relative position for rendering
  const relativePosition = numberManager.getRelativePosition(
    number.absoluteRow,
    number.absoluteCol
  );

  const containerRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const scaleRef = useRef(1);
  const glowIntensityRef = useRef(0);
  const isHighlightedRef = useRef(number.isHighlighted);
  const temperRef = useRef(number.temper);

  // Update refs when props change to avoid animation restarts
  useEffect(() => {
    isHighlightedRef.current = number.isHighlighted;
    temperRef.current = number.temper;
  }, [number.isHighlighted, number.temper]);

  // Initialize position and speed once
  useEffect(() => {
    if (!numberRef.current) return;

    const parent = numberRef.current.parentElement;
    if (!parent) return;

    const {
      width: containerWidth,
      height: containerHeight,
      left,
      top,
    } = parent.getBoundingClientRect();

    // Store container position for faster pointer calculations
    containerRef.current = {
      x: left + containerWidth / 2,
      y: top + containerHeight / 2,
      width: containerWidth,
      height: containerHeight,
    };

    const X_OFFSET = 5;
    const Y_OFFSET = 10;
    const minX = 0 - X_OFFSET + GRID_CONFIG.CELL_INNER_BOUND;
    const maxX = containerWidth - X_OFFSET - GRID_CONFIG.CELL_INNER_BOUND;
    const minY = 0 - Y_OFFSET + GRID_CONFIG.CELL_INNER_BOUND;
    const maxY = containerHeight - Y_OFFSET - GRID_CONFIG.CELL_INNER_BOUND;

    // Set initial boundaries
    boundsRef.current = { minX, maxX, minY, maxY };

    // Set initial position
    positionRef.current = {
      x: Math.random() * maxX,
      y: Math.random() * maxY,
    };

    // Set initial speed
    const speedMagnitudeX =
      GRID_CONFIG.NUMBER_MOVEMENT_BASE_SPEED +
      Math.random() * GRID_CONFIG.NUMBER_MOVEMENT_BASE_SPEED;
    const speedMagnitudeY =
      GRID_CONFIG.NUMBER_MOVEMENT_BASE_SPEED +
      Math.random() * GRID_CONFIG.NUMBER_MOVEMENT_BASE_SPEED;
    speedRef.current = {
      x: speedMagnitudeX * (Math.random() > 0.5 ? 1 : -1),
      y: speedMagnitudeY * (Math.random() > 0.5 ? 1 : -1),
    };

    // Apply initial position
    if (!numberRef.current) return;
    numberRef.current.style.opacity = "100%";
    // HACK: Force browser to use GPU by using translate3d hack.
    numberRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) scale(1)`;
  }, []);

  const animate = useCallback(() => {
    if (!numberRef.current) return;

    // Calculate scale based on pointer position
    const pointerState = pointerManager.store.getState();
    const gridRect = pointerState.gridRect;

    if (gridRect) {
      // Get the current relative position
      const { relativeRow, relativeCol } = numberManager.getRelativePosition(
        number.absoluteRow,
        number.absoluteCol
      );

      // Calculate the cell's center position in screen coordinates
      const cellCenterX =
        gridRect.left + (relativeCol + 0.5) * GRID_CONFIG.CELL_SIZE;
      const cellCenterY =
        gridRect.top + (relativeRow + 0.5) * GRID_CONFIG.CELL_SIZE;

      // Calculate distance from pointer to cell center
      const distanceFromPointer = Math.sqrt(
        Math.pow(pointerState.x - cellCenterX, 2) +
          Math.pow(pointerState.y - cellCenterY, 2)
      );

      // Calculate scale based on distance
      const distanceRatio = Math.max(
        0,
        Math.min(
          1,
          (GRID_CONFIG.POINTER_INFLUENCE_RADIUS - distanceFromPointer) /
            GRID_CONFIG.POINTER_INFLUENCE_RADIUS
        )
      );

      // Use a smooth transition for the highlight scale effect
      const targetScale =
        // base scale
        1 +
        // dynamic scale based on distance from pointer
        distanceRatio * (GRID_CONFIG.MAX_SCALE - 1) +
        // if highlighted, scale up
        (isHighlightedRef.current ? 0.25 : 0);

      // Smoothly interpolate to the target scale
      scaleRef.current =
        scaleRef.current + (targetScale - scaleRef.current) * 0.1;

      glowIntensityRef.current = distanceRatio * 10;
    }

    // Update position based on time elapsed
    positionRef.current.x += speedRef.current.x;
    positionRef.current.y += speedRef.current.y;

    // Boundary checks
    const { minX, maxX, minY, maxY } = boundsRef.current;
    if (positionRef.current.x > maxX || positionRef.current.x < minX) {
      speedRef.current.x *= -1;
      positionRef.current.x = positionRef.current.x < minX ? minX : maxX;
    }
    if (positionRef.current.y > maxY || positionRef.current.y < minY) {
      speedRef.current.y *= -1;
      positionRef.current.y = positionRef.current.y < minY ? minY : maxY;
    }

    // Apply the transform directly to the DOM element
    numberRef.current.style.opacity = "100%";

    // Use CSS variables for transitions
    if (isHighlightedRef.current) {
      numberRef.current.style.setProperty(
        "--glow-intensity",
        `${glowIntensityRef.current + 5}px`
      );
    } else {
      numberRef.current.style.setProperty(
        "--glow-intensity",
        `${glowIntensityRef.current}px`
      );
    }

    const shakeIntensity = (() => {
      switch (temperRef.current) {
        case "WO":
          return 1.5;
        case "FC":
          return 2;
        case "DR":
          return 2.5;
        case "MA":
          return 3;
        default:
          return 0;
      }
    })();

    const scaleIntensity = (() => {
      switch (temperRef.current) {
        case "WO":
          return 1;
        case "DR":
          return 1.1;
        case "FC":
          return 1.2;
        case "MA":
          return 1.3;
        default:
          return 1;
      }
    })();

    // Add shaking effect when number is highlighted
    // Define shake intensity and generate random shake offset within that range
    const shakeOffsetX = (Math.random() - 0.5) * shakeIntensity;
    const shakeOffsetY = (Math.random() - 0.5) * shakeIntensity;

    // Apply shake offset to the current position
    // Force browser to use GPU by using translate3d hack.
    const shakeAndScaleTransform = `translate3d(${
      positionRef.current.x + shakeOffsetX
    }px, ${positionRef.current.y + shakeOffsetY}px, 0) scale(${
      scaleRef.current * scaleIntensity
    })`;
    numberRef.current.style.transform = shakeAndScaleTransform;
  }, [numberManager, pointerManager, number.absoluteRow, number.absoluteCol]);

  // When mounted, start moving the number element in the cell container.
  useEffect(() => {
    const numberElement = numberRef.current;
    if (!numberElement) return;

    // Only start the animation if it's not already running
    if (animationFrameRef.current === null) {
      const loop = () => {
        animate();
        animationFrameRef.current = requestAnimationFrame(loop);
      };
      animationFrameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Clean up any ongoing CSS transitions to prevent memory leaks
      if (!numberElement) return;
      numberElement.style.transition = "";
      numberElement.style.transform = "";
      numberElement.style.filter = "";
      numberElement.style.opacity = "0";
    };
  }, [animate]);

  return (
    <>
      {/* The cell container */}
      <div
        className="overflow-visible"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: GRID_CONFIG.CELL_SIZE,
          height: GRID_CONFIG.CELL_SIZE,
          // Position the cell in the grid.
          transform: `
            translateX(${
              relativePosition.relativeCol * GRID_CONFIG.CELL_SIZE
            }px)
            translateY(${
              relativePosition.relativeRow * GRID_CONFIG.CELL_SIZE
            }px)
          `,
          zIndex: 0,
        }}
      >
        {/* The number itself */}
        <span
          id={cellId}
          ref={numberRef}
          className={cn(
            "absolute top-0 left-0",
            "origin-center",
            "font-extrabold font-sans text-xl",
            "will-change-[transform,opacity,filter] opacity-0",
            "transition-[color,text-shadow,filter] duration-300 ease-in-out",
            "drop-shadow-[0_0_var(--glow-intensity,0px)_rgba(255,255,255,0.3)]",
            number.isHighlighted
              ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              : "text-foreground"
          )}
        >
          {number.val}
        </span>
      </div>
    </>
  );
}
