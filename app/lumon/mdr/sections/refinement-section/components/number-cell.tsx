"use client";

import { pointerManager } from "@/app/lumon/mdr/pointer-manager";
import { RefinementManager } from "@/app/lumon/mdr/refinement-manager";
import { GRID_CONFIG } from "@/app/lumon/mdr/sections/refinement-section/grid-config";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

type NumberCellProps = {
  cellId: string;
};

export function NumberCell({ cellId }: NumberCellProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const { numberManager } = RefinementManager.get();
  const number = numberManager.getNumber(cellId);

  const containerPositionRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  // Store movement state in refs to avoid re-renders
  const positionRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);

  // Calculate boundaries only once on initialization
  const boundsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 });

  // Initialize position and speed once
  useEffect(() => {
    if (initialized || !numberRef.current) return;

    const parent = numberRef.current.parentElement;
    if (!parent) return;

    const {
      width: containerWidth,
      height: containerHeight,
      left,
      top,
    } = parent.getBoundingClientRect();

    // Store container position for faster pointer calculations
    containerPositionRef.current = {
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
    if (numberRef.current) {
      numberRef.current.style.opacity = "100%";
      numberRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(1)`;
    }

    setInitialized(true);
  }, [initialized]);

  // Update container position on scroll or resize
  useEffect(() => {
    if (!initialized || !numberRef.current) return;

    const updateContainerPosition = () => {
      const parent = numberRef.current?.parentElement;
      if (!parent) return;

      const { width, height, left, top } = parent.getBoundingClientRect();
      containerPositionRef.current = {
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
  }, [initialized]);

  const animate = useCallback(() => {
    if (!numberRef.current) return;

    // Calculate distance from pointer for scale effect
    const distanceFromPointer = Math.sqrt(
      (pointerManager.pointerPosition.x - containerPositionRef.current.x) ** 2 +
        (pointerManager.pointerPosition.y - containerPositionRef.current.y) ** 2
    );

    const distanceRatio = Math.max(
      0,
      Math.min(
        1,
        (GRID_CONFIG.POINTER_INFLUENCE_RADIUS - distanceFromPointer) /
          GRID_CONFIG.POINTER_INFLUENCE_RADIUS
      )
    );
    const scale = 1 + distanceRatio * (GRID_CONFIG.MAX_SCALE - 1);

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
    numberRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px) scale(${scale})`;
  }, []);

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
        id={cellId}
        className="absolute top-0 left-0"
        style={{
          width: GRID_CONFIG.CELL_SIZE,
          height: GRID_CONFIG.CELL_SIZE,
          // Position the cell in the grid.
          transform: `
            translateX(${number.col * GRID_CONFIG.CELL_SIZE}px)
            translateY(${number.row * GRID_CONFIG.CELL_SIZE}px)
          `,
        }}
      >
        {/* The number itself */}
        <span
          ref={numberRef}
          className={cn(
            "absolute top-0 left-0",
            "origin-center",
            "font-bold font-mono text-foreground text-lg",
            "will-change-transform opacity-0 transition-all"
          )}
        >
          {number.val}
        </span>
      </div>
    </>
  );
}
