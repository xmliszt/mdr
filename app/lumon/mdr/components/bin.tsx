"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { sum } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { BinData, type BinDataMetrics } from "../bin-data";
import { BinProgress } from "./bin-progress";

export type BinProps = {
  bin: BinData;
};

export function Bin(props: BinProps) {
  const [metrics, setMetrics] = useState<BinDataMetrics>(
    props.bin.store.getState()
  );

  const leftLidControls = useAnimation();
  const rightLidControls = useAnimation();
  const metricsSheetControls = useAnimation();

  const animateLidsOpen = useCallback(async () => {
    // First skew the lids
    await Promise.all([
      leftLidControls.start({ skewY: -30 }),
      rightLidControls.start({ skewY: 30 }),
    ]);
    // Then rotate them
    await Promise.all([
      leftLidControls.start({ rotateY: -140 }),
      rightLidControls.start({ rotateY: 140 }),
    ]);
  }, [leftLidControls, rightLidControls]);

  const animateLidsClose = useCallback(async () => {
    // First rotate the lids
    await Promise.all([
      leftLidControls.start({ rotateY: 0 }),
      rightLidControls.start({ rotateY: 0 }),
    ]);
    // Then skew them
    await Promise.all([
      leftLidControls.start({ skewY: 0 }),
      rightLidControls.start({ skewY: 0 }),
    ]);
  }, [leftLidControls, rightLidControls]);

  const animateMetricsSheetRise = useCallback(async () => {
    // Increase the sheet's height to 100% of its own height
    // Set the sheet's bottom to the top of the bin
    await metricsSheetControls.start({
      height: "fit-content",
      transform: "translateY(-100%)",
    });
  }, [metricsSheetControls]);

  const animateMetricsSheetWithdraw = useCallback(async () => {
    // Decrease the sheet's height to 100% of the bin's height
    // Set the sheet's bottom to the bottom of the bin
    await metricsSheetControls.start({
      height: "0px",
      transform: "translateY(0%)",
    });
  }, [metricsSheetControls]);

  // Subscribe to the bin's store and animate the lid and metrics sheet when metrics change.
  useEffect(() => {
    const unsubscribe = props.bin.store.subscribe(async (metrics) => {
      // When metrics change, animate the lid and rise up the metrics sheet.
      await animateLidsOpen();
      await animateMetricsSheetRise();
      // After animation ends, set the metrics sheet to the new metrics.
      setMetrics(metrics);
      // Wait for the metrics sheet to be fully risen before closing the lid.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Then run closing animation to close the lid and withdraw the metrics sheet.
      await animateMetricsSheetWithdraw();
      await animateLidsClose();
    });
    return unsubscribe;
  }, [
    animateLidsOpen,
    animateLidsClose,
    animateMetricsSheetRise,
    animateMetricsSheetWithdraw,
    props.bin,
  ]);

  return (
    <div className="relative w-[140px] h-[70px] border flex flex-col gap-y-2 select-none">
      {/* Box lids hidden behind */}
      <motion.div
        id="left-lid"
        className="absolute top-0 left-0 h-4 w-1/2 border-2 border-accent-foreground origin-left"
        initial={{ skewY: 0, rotateY: 0 }}
        animate={leftLidControls}
        transition={{ duration: 1 }}
      />
      <motion.div
        id="right-lid"
        className="absolute top-0 right-0 h-4 w-1/2 border-2 border-accent-foreground origin-right"
        initial={{ skewY: 0, rotateY: 0 }}
        animate={rightLidControls}
        transition={{ duration: 1 }}
      />

      {/* Metric sheet */}
      <motion.div
        className="absolute top-0 w-full border-2 border-accent-foreground flex flex-col gap-y-2 bg-background p-1 overflow-hidden"
        animate={metricsSheetControls}
        transition={{ duration: 1 }}
        initial={{ height: "0px", transform: "translateY(0%)" }}
      >
        <div className="border-2 text-lg text-center px-2 py-1 border-accent-foreground">
          {props.bin.label}
        </div>
        <div className="flex flex-col gap-y-1.5 [&>div]:text-lg">
          {/* WO */}
          <div className="flex gap-x-1 items-center">
            WO <BinProgress progress={metrics.wo} color="rgb(57, 255, 20)" />
          </div>
          {/* FC */}
          <div className="flex gap-x-1 items-center">
            FC <BinProgress progress={metrics.fc} color="rgb(255, 255, 128)" />
          </div>
          {/* DR */}
          <div className="flex gap-x-1 items-center">
            DR <BinProgress progress={metrics.dr} color="rgb(180, 100, 255)" />
          </div>
          {/* MA */}
          <div className="flex gap-x-1 items-center">
            MA <BinProgress progress={metrics.ma} color="rgb(173, 216, 230)" />
          </div>
        </div>
      </motion.div>

      <div className="absolute h-full w-full inset-0 bg-background flex flex-col gap-y-2">
        <div
          className={cn(
            "h-[40px] border-2 border-accent-foreground w-full flex justify-center items-center",
            "font-mono font-bold text-accent-foreground text-lg bg-background"
          )}
        >
          {props.bin.label}
        </div>
        <div className="h-[30px] border-2 border-accent-foreground w-full">
          <BinProgress progress={sum(Object.values(metrics)) / 4} />
        </div>
      </div>
    </div>
  );
}
