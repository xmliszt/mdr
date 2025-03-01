"use client";

import { Button } from "@/components/ui/button";
import { LumonLink } from "./components/lumon-link";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error(props: ErrorProps) {
  return (
    <div className="flex h-screen flex-col items-start justify-center p-[20%]">
      <div className="absolute top-0 left-0">
        <LumonLink redirect="/" />
      </div>

      <h1 className="text-3xl mb-4 text-destructive">
        System Error: Computational Anomaly Detected
      </h1>
      <p className="text-xl">
        A critical deviation has occurred in the processing matrix. Error code:{" "}
        {props.error.message || "Unknown error"}
      </p>
      <p className="mt-4">
        The system has logged this incident. Please click the reset button or
        return to your designated workstation.
      </p>

      <Button onClick={props.reset} variant="outline" className="mt-4">
        Attempt Reset
      </Button>
    </div>
  );
}
