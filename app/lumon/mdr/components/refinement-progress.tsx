"use client";

import { useEffect, useRef, useState } from "react";

type RefinementProgressProps = {
  /**
   * The percentage progress of the refinement, between 0 and 1. i.e. 50% is 0.5
   */
  progress: number;
  /**
   * The label of the file being refined
   */
  fileLabel: string;
};

export function RefinementProgress(props: RefinementProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const BLOCK_WIDTH = 12;
  const totalBlocks = Math.floor(containerWidth / BLOCK_WIDTH);
  const filledBlocks = Math.floor(props.progress * totalBlocks);

  // When window resized, update the container width
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.clientWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="select-none absolute inset-0 top-10 h-[46px] ml-4 mr-[155px] border border-accent-foreground flex flex-row-reverse"
    >
      {Array.from({ length: totalBlocks }).map((_, index) => (
        <div
          key={index}
          className={`flex-1 w-2 ${
            index < filledBlocks ? "bg-accent-foreground" : "bg-accent"
          } ${
            index === 0
              ? "ml-[1.5px]"
              : index === totalBlocks - 1
              ? "mr-[1.5px]"
              : "mx-[1.5px]"
          }`}
        />
      ))}
      {/* Progress text */}
      <svg
        width="200px"
        height="100%"
        className="absolute truncate right-0 top-1/2 -translate-y-1/2"
      >
        <text
          x="0"
          y="23"
          className="font-mono text-2xl font-bold fill-accent"
          stroke="var(--accent-foreground)"
          strokeWidth="2"
          paintOrder="stroke"
          dominantBaseline="middle"
        >
          {Math.round(props.progress * 100)}% Complete
        </text>
      </svg>
      {/* File label */}
      <svg
        width="100%"
        height="100%"
        className="absolute left-12 top-1/2 -translate-y-1/2"
      >
        <text
          x="0"
          y="23"
          className="font-mono text-2xl fill-accent"
          stroke="var(--accent-foreground)"
          strokeWidth="2"
          paintOrder="stroke"
          dominantBaseline="middle"
        >
          {props.fileLabel}
        </text>
      </svg>
    </div>
  );
}
