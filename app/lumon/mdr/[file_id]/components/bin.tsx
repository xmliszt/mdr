"use client";

import {
  BinData,
  type BinDataMetrics,
} from "@/app/lumon/mdr/[file_id]/bin-data";
import { BinProgress } from "@/app/lumon/mdr/[file_id]/components/bin-progress";
import { cn } from "@/lib/utils";
import { motion, useAnimate } from "framer-motion";
import { sum } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

export type BinProps = {
  bin: BinData;
  onClick: () => void;
};

export function Bin(props: BinProps) {
  const [displayMetrics, setDisplayMetrics] = useState<BinDataMetrics>(
    props.bin.store.getState()
  );

  const [leftLidScope, animateLeftLid] = useAnimate();
  const [rightLidScope, animateRightLid] = useAnimate();
  const [metricsSheetScope, animateMetricsSheet] = useAnimate();

  // Track mounted state to prevent animations on unmounted components
  const isMounted = useRef(true);

  const animateLidsOpen = useCallback(async () => {
    if (!isMounted.current || !leftLidScope.current || !rightLidScope.current)
      return;
    await Promise.all([
      animateLeftLid(leftLidScope.current, { skewY: -30 }, { duration: 0.5 }),
      animateRightLid(rightLidScope.current, { skewY: 30 }, { duration: 0.5 }),
    ]);
    await Promise.all([
      animateLeftLid(
        leftLidScope.current,
        { rotateY: -140 },
        { duration: 0.5 }
      ),
      animateRightLid(
        rightLidScope.current,
        { rotateY: 140 },
        { duration: 0.5 }
      ),
    ]);
  }, [animateLeftLid, animateRightLid, leftLidScope, rightLidScope]);

  const animateLidsClose = useCallback(async () => {
    if (!isMounted.current || !leftLidScope.current || !rightLidScope.current)
      return;
    await Promise.all([
      animateLeftLid(leftLidScope.current, { rotateY: 0 }, { duration: 0.5 }),
      animateRightLid(rightLidScope.current, { rotateY: 0 }, { duration: 0.5 }),
    ]);
    await Promise.all([
      animateLeftLid(leftLidScope.current, { skewY: 0 }, { duration: 0.5 }),
      animateRightLid(rightLidScope.current, { skewY: 0 }, { duration: 0.5 }),
    ]);
  }, [animateLeftLid, animateRightLid, leftLidScope, rightLidScope]);

  const animateMetricsSheetRise = useCallback(async () => {
    if (!isMounted.current || !metricsSheetScope.current) return;
    await animateMetricsSheet(
      metricsSheetScope.current,
      {
        height: "200px",
      },
      { duration: 1 }
    );
  }, [animateMetricsSheet, metricsSheetScope]);

  const animateMetricsSheetWithdraw = useCallback(async () => {
    if (!isMounted.current || !metricsSheetScope.current) return;
    await animateMetricsSheet(
      metricsSheetScope.current,
      {
        height: "0px",
      },
      { duration: 1 }
    );
  }, [animateMetricsSheet, metricsSheetScope]);

  // Subscribe to the bin's store with cleanup
  useEffect(() => {
    let isCurrent = true; // Local flag to prevent stale updates

    const unsubscribe = props.bin.store.subscribe((metrics) => {
      if (!isCurrent) return; // Skip if component is unmounted

      (async () => {
        await animateLidsOpen();
        await animateMetricsSheetRise();
        setDisplayMetrics(metrics); // Update state after rise
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await animateMetricsSheetWithdraw();
        await animateLidsClose();
      })();
    });

    return () => {
      isCurrent = false; // Mark as unmounted
      unsubscribe(); // Clean up subscription
    };
  }, [
    animateLidsOpen,
    animateLidsClose,
    animateMetricsSheetRise,
    animateMetricsSheetWithdraw,
    props.bin,
  ]);

  return (
    <div
      id={props.bin.binId}
      className={cn(
        "relative w-[140px] h-[70px] border flex flex-col gap-y-2 select-none",
        "hover:scale-105 transition-all ease-in-out"
      )}
      onClick={props.onClick}
    >
      {/* Box lids hidden behind */}
      <motion.div
        id="left-lid"
        ref={leftLidScope}
        className="absolute top-0 left-0 h-4 w-1/2 border-2 border-accent-foreground origin-left"
        initial={{ skewY: 0, rotateY: 0 }}
      />
      <motion.div
        id="right-lid"
        ref={rightLidScope}
        className="absolute top-0 right-0 h-4 w-1/2 border-2 border-accent-foreground origin-right"
        initial={{ skewY: 0, rotateY: 0 }}
      />

      {/* Metric sheet */}
      <motion.div
        ref={metricsSheetScope}
        className="absolute top-4 w-full border-2 border-accent-foreground flex flex-col gap-y-2 bg-background p-1 overflow-hidden origin-top -translate-y-full"
        initial={{ height: "0px" }}
      >
        <div className="border-2 text-lg text-center px-2 py-1 border-accent-foreground">
          {props.bin.label}
        </div>
        <div className="flex flex-col gap-y-1.5 [&>div]:text-lg">
          {/* WO */}
          <div className="flex gap-x-1 items-center h-6">
            <span className="font-mono">WO</span>{" "}
            <BinProgress progress={displayMetrics.wo} color="#5eff4d" />
          </div>
          {/* FC */}
          <div className="flex gap-x-1 items-center h-6">
            <span className="font-mono">FC</span>{" "}
            <BinProgress progress={displayMetrics.fc} color="#fffe48" />
          </div>
          {/* DR */}
          <div className="flex gap-x-1 items-center h-6">
            <span className="font-mono">DR</span>{" "}
            <BinProgress progress={displayMetrics.dr} color="#fff9e9" />
          </div>
          {/* MA */}
          <div className="flex gap-x-1 items-center h-6">
            <span className="font-mono">MA</span>{" "}
            <BinProgress progress={displayMetrics.ma} color="#75ffff" />
          </div>
        </div>
      </motion.div>

      <div className="absolute h-full w-full inset-0 bg-background flex flex-col gap-y-2">
        <div
          className={cn(
            "h-[40px] border-2 border-accent-foreground w-full flex justify-center items-center",
            "font-bold text-accent-foreground text-lg bg-background"
          )}
        >
          {props.bin.label}
        </div>
        <div className="h-[30px] border-2 border-accent-foreground w-full">
          <BinProgress
            progress={sum(Object.values(displayMetrics)) / 4}
            showLabel
          />
        </div>
      </div>
    </div>
  );
}
