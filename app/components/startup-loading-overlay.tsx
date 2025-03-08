"use client";

import { motion, useAnimate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";

// Text content from the image
const startupText = [
  "Open interface: 0x100000531",
  "parseElements: keyboard: 0 digitizer: 12 pointer: 0 0 scroll: 0 led: 0",
  "parseElements: vendor: 2",
  "HE2N_Key Does Not Exist, use kSMCPStatesIGPU for Internal GPU",
  "GPU = IGPU Initialized, Control ID 16",
  "Exited AGPMController::start()",
  "-- 0x5c30 -- 0xe000 -- 0x7e00 ****",
  "initWithTask",
  "start",
  "**** -- ON -> ON (thread: 0xfa40)",
  "Speaker has output streams: 1",
  "Reuse output buffer idx:1 dev:Speaker offset:13c000 size:41000",
  "Codec Output has output streams: 1",
  "Reuse output buffer idx:2 dev:Codec Output offset:184000 size:20800",
  "Digital Mic has output streams: 0",
  "Codec Input has output streams: 0",
  "Total output descriptors: 3",
  "Device:Speaker using output stream idx:1",
  "Registered DeviceUID:Speaker Index:1",
  "ActuatorDeviceUserClient::start Entered",
];

export function StartupLoadingOverlay() {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>("");
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [scope, animate] = useAnimate();
  const typingSpeed = useRef(0.5); // milliseconds per character
  const initialized = InitializedStore();

  // Type out characters one by one
  useEffect(() => {
    if (currentLineIndex >= startupText.length) {
      setIsComplete(true);
      return;
    }

    const currentLine = startupText[currentLineIndex];

    if (currentText.length < currentLine.length) {
      // Still typing the current line
      const timeout = setTimeout(() => {
        setCurrentText(currentLine.substring(0, currentText.length + 1));
      }, typingSpeed.current + Math.random() * 20); // Add some randomness to typing speed

      return () => clearTimeout(timeout);
    } else {
      // Line complete, move to next line
      const nextLineTimeout = setTimeout(() => {
        setCompletedLines([...completedLines, currentText]);
        setCurrentText("");
        setCurrentLineIndex(currentLineIndex + 1);
      }, 100 + Math.random() * 100); // Random delay between lines

      return () => clearTimeout(nextLineTimeout);
    }
  }, [currentLineIndex, currentText, completedLines]);

  // Fade out the overlay when animation is complete
  useEffect(() => {
    if (!isComplete) return;

    const element = scope.current;
    if (!element) return;

    // Add a few seconds delay before fading out
    const fadeOutTimeout = setTimeout(async () => {
      await animate(element, { opacity: 0 }, { duration: 1 });
      InitializedStore.setState(true);
    }, 1500); // 3 seconds delay

    // Cleanup timeout on unmount
    return () => clearTimeout(fadeOutTimeout);
  }, [animate, isComplete, scope]);

  if (completedLines.length === 0 && currentText === "") return null;
  if (initialized) return null;

  return (
    <motion.div
      id="crt-overlay"
      ref={scope}
      className="fixed inset-0 bg-background z-50 flex overflow-hidden pointer-events-none"
      initial={{ opacity: 1 }}
    >
      <div className="w-full max-w-4xl p-8 overflow-hidden">
        <div className="font-mono text-sm text-accent-foreground leading-tight">
          {completedLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="whitespace-pre"
            >
              {line}
            </motion.div>
          ))}
          {currentText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="whitespace-pre border-r-2 border-accent-foreground animate-pulse"
            >
              {currentText}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export const InitializedStore = create<boolean>(() => false);
