"use client";

import { useEffect } from "react";

import { useState } from "react";

export function FooterSection() {
  const [serial, setSerial] = useState("");

  function generateRandomSerial() {
    return `0x${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, "0")} : 0x${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, "0")}`;
  }

  useEffect(() => {
    setSerial(generateRandomSerial());
  }, []);

  return (
    <div className="h-12 flex w-full bg-accent-foreground justify-center items-center select-none">
      <div className="h-full text-accent  text-lg flex justify-center items-center w-full">
        {serial}
      </div>
    </div>
  );
}
