"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimate } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type LumonLinkProps = {
  redirect?: string;
  children?: React.ReactNode;
  disabled?: boolean;
};

export function LumonLink(props: LumonLinkProps) {
  const router = useRouter();
  const [scope, animate] = useAnimate();
  const isMounted = useRef(true);

  const runFlickerAnimation = useCallback(async () => {
    // Ensure the element is mounted before starting animations
    if (!scope.current) return;

    // Initial animation to fade in and slide up
    await animate(
      scope.current,
      { opacity: 1, y: 0 },
      { duration: 0.75, ease: "easeOut", delay: 0.25 }
    );

    // Flickering effect after initial animation
    async function flicker() {
      while (isMounted.current) {
        // Random delay before next flicker
        const waitTime = 1 + Math.random() * 5;
        await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
        if (!isMounted.current) return;

        // Random flicker intensity
        const flickerIntensity = Math.random();

        // Quick flicker sequence
        await animate(
          scope.current,
          { opacity: flickerIntensity },
          { duration: 0.1 }
        );
        await animate(scope.current, { opacity: 1 }, { duration: 0.1 });

        // Occasional double flicker
        if (Math.random() > 0.7) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (!isMounted.current) return;
          await animate(
            scope.current,
            { opacity: flickerIntensity },
            { duration: 0.05 }
          );
          await animate(scope.current, { opacity: 1 }, { duration: 0.05 });
        }
      }
    }

    await flicker();
  }, [animate, scope]);

  useEffect(() => {
    // Start the animation sequence
    runFlickerAnimation();

    // Cleanup to stop the flicker loop on unmount
    return () => {
      isMounted.current = false;
    };
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
        ref={scope}
        initial={{ opacity: 0, y: -20 }}
        className="select-none !text-[2.5rem]"
      >
        {props.children ?? "Lumon"}
      </motion.h1>
    </motion.div>
  );
}