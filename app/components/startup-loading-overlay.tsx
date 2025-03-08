"use client";

import { motion, useAnimate } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";

export function StartupLoadingOverlay() {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>("");
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [scope, animate] = useAnimate();
  const typingSpeed = useRef(0.1); // milliseconds per character
  const initialized = InitializedStore();

  // Variables for the startup text
  const [interfaceId, setInterfaceId] = useState<string>("");
  const [keyboardCount, setKeyboardCount] = useState<number>(0);
  const [digitizerCount, setDigitizerCount] = useState<number>(0);
  const [pointerCount, setPointerCount] = useState<number>(0);
  const [scrollCount, setScrollCount] = useState<number>(0);
  const [ledCount, setLedCount] = useState<number>(0);
  const [vendorCount, setVendorCount] = useState<number>(0);
  const [gpuCount, setGpuCount] = useState<number>(0);
  const [speakerCount, setSpeakerCount] = useState<number>(0);
  const [codecOutputCount, setCodecOutputCount] = useState<number>(0);
  const [digitalMicCount, setDigitalMicCount] = useState<number>(0);
  const [codecInputCount, setCodecInputCount] = useState<number>(0);
  const [totalOutputDescriptors, setTotalOutputDescriptors] =
    useState<number>(0);

  const getStartupText = useCallback(() => {
    return [
      `Open interface: 0x${interfaceId}`,
      `parseElements: keyboard: ${keyboardCount} digitizer: ${digitizerCount} pointer: ${pointerCount} 0 scroll: ${scrollCount} led: ${ledCount}`,
      `parseElements: vendor: ${vendorCount}`,
      "HE2N_Key Does Not Exist, use kSMCPStatesIGPU for Internal GPU",
      `GPU = IGPU Initialized, Control ID ${gpuCount}`,
      "Exited AGPMController::start()",
      "-- 0x5c30 -- 0xe000 -- 0x7e00 ****",
      "initWithTask",
      "start",
      "**** -- ON -> ON (thread: 0xfa40)",
      `Speaker has output streams: ${speakerCount}`,
      "Reuse output buffer idx:1 dev:Speaker offset:13c000 size:41000",
      `Codec Output has output streams: ${codecOutputCount}`,
      "Reuse output buffer idx:2 dev:Codec Output offset:184000 size:20800",
      `Digital Mic has output streams: ${digitalMicCount}`,
      `Codec Input has output streams: ${codecInputCount}`,
      `Total output descriptors: ${totalOutputDescriptors}`,
      `Device:Speaker using output stream idx:${speakerCount}`,
      `Registered DeviceUID:Speaker Index:${speakerCount}`,
      "ActuatorDeviceUserClient::start Entered",
    ];
  }, [
    codecInputCount,
    codecOutputCount,
    digitalMicCount,
    digitizerCount,
    gpuCount,
    interfaceId,
    keyboardCount,
    ledCount,
    pointerCount,
    scrollCount,
    speakerCount,
    totalOutputDescriptors,
    vendorCount,
  ]);

  useEffect(() => {
    // Generate random interface ID
    const interfaceId = Math.floor(Math.random() * 0xffffffff).toString(16);
    setInterfaceId(interfaceId);

    // Generate random counts for the startup text
    const keyboardCount = Math.floor(Math.random() * 10);
    const digitizerCount = Math.floor(Math.random() * 10);
    const pointerCount = Math.floor(Math.random() * 10);
    const scrollCount = Math.floor(Math.random() * 10);
    const ledCount = Math.floor(Math.random() * 10);
    const vendorCount = Math.floor(Math.random() * 10);
    const gpuCount = Math.floor(Math.random() * 10);
    const speakerCount = Math.floor(Math.random() * 10);
    const codecOutputCount = Math.floor(Math.random() * 10);
    const digitalMicCount = Math.floor(Math.random() * 10);
    const codecInputCount = Math.floor(Math.random() * 10);
    const totalOutputDescriptors = Math.floor(Math.random() * 10);

    setKeyboardCount(keyboardCount);
    setDigitizerCount(digitizerCount);
    setPointerCount(pointerCount);
    setScrollCount(scrollCount);
    setLedCount(ledCount);
    setVendorCount(vendorCount);
    setGpuCount(gpuCount);
    setSpeakerCount(speakerCount);
    setCodecOutputCount(codecOutputCount);
    setDigitalMicCount(digitalMicCount);
    setCodecInputCount(codecInputCount);
    setTotalOutputDescriptors(totalOutputDescriptors);
  }, []);

  // Type out characters one by one
  useEffect(() => {
    if (currentLineIndex >= getStartupText().length) {
      setIsComplete(true);
      return;
    }

    const currentLine = getStartupText()[currentLineIndex];

    if (currentText.length < currentLine.length) {
      // Still typing the current line
      const timeout = setTimeout(() => {
        setCurrentText(currentLine.substring(0, currentText.length + 1));
      }, typingSpeed.current + Math.random() * 10); // Add some randomness to typing speed

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
  }, [currentLineIndex, currentText, completedLines, getStartupText]);

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
      className="fixed inset-0 bg-background z-50 flex overflow-hidden pointer-events-none select-none cursor-default"
      initial={{ opacity: 1 }}
    >
      <div className="w-full max-w-4xl p-8 overflow-hidden">
        <div className="font-mono text-sm text-accent-foreground leading-tight">
          {completedLines.map((line, index) => (
            <motion.div key={index} className="whitespace-pre">
              {line}
            </motion.div>
          ))}
          {currentText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
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
