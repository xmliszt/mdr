"use client";

import { ThumbsDown } from "lucide-react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

type LumonNopeDialogProps = {
  onClose: () => void;
};

export function LumonNopeDialog({ onClose }: LumonNopeDialogProps) {
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
          <ThumbsDown className="size-12 -scale-x-100 stroke-1" />
          <span className="text-5xl font-normal text-accent-foreground">
            Nope
          </span>
        </div>
      </div>
    </div>
  );
}

export const lumonNopeDialog = {
  show: () => {
    // If the dialog is already open, do nothing
    if (document.getElementById("lumon-nope-dialog-container")) return;

    // Create the container element
    const container = document.createElement("div");
    container.id = "lumon-nope-dialog-container";
    document.body.appendChild(container);

    // Create the root element
    const root = createRoot(container);
    root.render(<LumonNopeDialog onClose={() => lumonNopeDialog.hide()} />);
  },
  hide: () => {
    const container = document.getElementById("lumon-nope-dialog-container");
    if (!container) return;
    document.body.removeChild(container);
  },
};
