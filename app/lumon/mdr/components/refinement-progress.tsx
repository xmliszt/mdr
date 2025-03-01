"use client";

import { cn } from "@/lib/utils";
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
      <div
        className={cn(
          "absolute text-2xl right-12 top-1/2 -translate-y-1/2 font-bold font-mono p-2 truncate max-w-full text-accent"
        )}
      >
        {Math.round(props.progress * 100)}% Complete
      </div>
      {/* File label */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 font-mono text-2xl text-accent-foreground">
        {props.fileLabel}
      </div>
    </div>
  );
}
