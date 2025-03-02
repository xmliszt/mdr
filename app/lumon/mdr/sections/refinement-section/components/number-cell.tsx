"use client";

import { RefinementManager } from "@/app/lumon/mdr/refinement-manager";
import { GRID_CONFIG } from "@/app/lumon/mdr/sections/refinement-section/grid-config";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

type NumberCellProps = {
  cellId: string;
};

export function NumberCell({ cellId }: NumberCellProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const { numberManager, pointerManager } = RefinementManager.get();
  const number = numberManager.getNumber(cellId);

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });

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
    numberRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(1)`;
  }, []);

  // Update container position on scroll or resize
  useEffect(() => {
    if (!numberRef.current) return;

    const updateContainerPosition = () => {
      const parent = numberRef.current?.parentElement;
      if (!parent) return;

      const { width, height, left, top } = parent.getBoundingClientRect();
      containerRef.current = {
        x: left + width / 2,
        y: top + height / 2,
        width,
        height,
      };
    };

    window.addEventListener("scroll", updateContainerPosition);
    window.addEventListener("resize", updateContainerPosition);

    return () => {
      window.removeEventListener("scroll", updateContainerPosition);
      window.removeEventListener("resize", updateContainerPosition);
    };
  }, []);

  const animate = useCallback(() => {
    if (!numberRef.current) return;

    // Calculate distance from pointer for scale effect
    const distanceFromPointer = Math.sqrt(
      (pointerManager.pointerPosition.x - containerRef.current.x) ** 2 +
        (pointerManager.pointerPosition.y - containerRef.current.y) ** 2
    );

    const distanceRatio = Math.max(
      0,
      Math.min(
        1,
        (GRID_CONFIG.POINTER_INFLUENCE_RADIUS - distanceFromPointer) /
          GRID_CONFIG.POINTER_INFLUENCE_RADIUS
      )
    );
    const scale =
      // base scale
      1 +
      // dynamic scale based on distance from pointer
      distanceRatio * (GRID_CONFIG.MAX_SCALE - 1) +
      // if highlighted, scale up
      (number.isHighlighted ? 0.25 : 0);
    const glowIntensity = distanceRatio * 10;

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
    numberRef.current.style.filter = `drop-shadow(0 0 ${glowIntensity}px rgba(255, 255, 255, 0.3))`;

    const shakeIntensity = (() => {
      switch (number.temper) {
        case "WO":
          return 4;
        case "FC":
          return 5;
        case "DR":
          return 3;
        case "MA":
          return 6;
        default:
          return 0;
      }
    })();

    const scaleIntensity = (() => {
      switch (number.temper) {
        case "WO":
          return 1;
        case "FC":
          return 1.2;
        case "DR":
          return 1.1;
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
    const shakeAndScaleTransform = `translate(${
      positionRef.current.x + shakeOffsetX
    }px, ${positionRef.current.y + shakeOffsetY}px) scale(${
      scale * scaleIntensity
    })`;
    numberRef.current.style.transform = shakeAndScaleTransform;
  }, [
    number.isHighlighted,
    number.temper,
    pointerManager.pointerPosition.x,
    pointerManager.pointerPosition.y,
  ]);

  // When mounted, start moving the number element in the cell container.
  useEffect(() => {
    if (!numberRef.current) return;

    // Start the animation loop with a reasonable interval
    intervalIdRef.current = setInterval(animate, 100);

    // Clean up
    return () => {
      if (!intervalIdRef.current) return;
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    };
  }, [animate, cellId]);

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
            translateX(${number.col * GRID_CONFIG.CELL_SIZE}px)
            translateY(${number.row * GRID_CONFIG.CELL_SIZE}px)
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
            "font-extrabold font-sans text-foreground text-xl",
            "will-change-[transform,opacity,filter] opacity-0 transition-all",
            number.isHighlighted && "text-white"
          )}
        >
          {number.val}
        </span>
      </div>
    </>
  );
}
