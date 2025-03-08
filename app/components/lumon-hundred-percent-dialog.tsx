"use client";

import { ThumbsUp } from "lucide-react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

type LumonHundredPercentDialogProps = {
  onClose: () => void;
};

export function LumonHundredPercentDialog({
  onClose,
}: LumonHundredPercentDialogProps) {
  // Handle Escape key to close the dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
      }}
      className="z-[9999] fixed shadow-inner inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]"
    >
      <div className="shadow-lg  rounded-md border-2 border-accent-foreground p-10 bg-background">
        <div className="flex items-center gap-x-12">
          <ThumbsUp className="size-12 stroke-1" />
          <span className="text-5xl font-normal text-accent-foreground">
            100%
          </span>
        </div>
      </div>
    </div>
  );
}

export const lumonHundredPercentDialog = {
  show: () => {
    const container = document.createElement("div");
    container.id = "lumon-hundred-percent-dialog-container";
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(
      <LumonHundredPercentDialog
        onClose={() => lumonHundredPercentDialog.hide()}
      />
    );
  },
  hide: () => {
    const container = document.getElementById(
      "lumon-hundred-percent-dialog-container"
    );
    if (!container) return;
    document.body.removeChild(container);
  },
};
