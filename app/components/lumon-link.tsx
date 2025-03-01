"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

type LumonLinkProps = {
  redirect?: string;
  children?: React.ReactNode;
  disabled?: boolean;
};

export function LumonLink(props: LumonLinkProps) {
  const router = useRouter();
  const controls = useAnimation();

  const runFlickerAnimation = useCallback(async () => {
    // Initial animation
    await controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: "easeOut", delay: 0.25 },
    });

    // Start flickering after initial animation
    async function flicker() {
      while (true) {
        // Random time before next flicker
        const waitTime = 1 + Math.random() * 5;
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));

        // Random flicker intensity
        const flickerIntensity = Math.random();

        // Quick flicker sequence
        await controls.start({
          opacity: flickerIntensity,
          transition: { duration: 0.1 },
        });
        await controls.start({
          opacity: 1,
          transition: { duration: 0.1 },
        });

        // Sometimes do a double flicker
        if (Math.random() > 0.7) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          await controls.start({
            opacity: flickerIntensity,
            transition: { duration: 0.05 },
          });
          await controls.start({
            opacity: 1,
            transition: { duration: 0.05 },
          });
        }
      }
    }

    flicker();
  }, [controls]);

  useEffect(() => {
    runFlickerAnimation();
  }, [runFlickerAnimation]);

  return (
    <motion.div
      onClick={() => {
        if (props.disabled) return;
        if (typeof props.redirect !== "string") return;
        router.push(props.redirect);
      }}
      className={cn(
        "hover:[text-shadow:0_0_12px_rgba(255,255,255,1)] transition-all ease-in-out p-4",
        props.disabled && "pointer-events-none"
      )}
    >
      <motion.h1
        id="logo"
        className="select-none !text-[2.5rem]"
        initial={{ opacity: 0, y: -20 }}
        animate={controls}
      >
        {props.children ?? "Lumon"}
      </motion.h1>
    </motion.div>
  );
}
