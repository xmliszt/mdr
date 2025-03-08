"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type LumonCompleteDialogProps = {
  onClose: () => void;
};

export function LumonCompleteDialog({ onClose }: LumonCompleteDialogProps) {
  const [open, setOpen] = useState(true);
  const [showPercentage, setShowPercentage] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  // Handle Escape key to close the dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // Timer to transition from percentage to video
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPercentage(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] [@media(max-width:768px)]:max-w-[90vw] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Refinement 100% Complete
          </DialogTitle>
          <DialogDescription>
            Congratulations on completing the refinement. By refining the data
            file, you have brought glory to this company and to Kier.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full relative">
          <AnimatePresence mode="wait">
            {showPercentage ? (
              <motion.div
                key="percentage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-[16vw] font-bold">100%</span>
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/U6EUG22elbs?autoplay=1"
                  title="Severance - Helly reaches one hundred percent"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const lumonCompleteDialog = {
  show: () => {
    const container = document.createElement("div");
    container.id = "lumon-complete-dialog-container";
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(
      <LumonCompleteDialog onClose={() => lumonCompleteDialog.hide()} />
    );
  },
  hide: () => {
    const container = document.getElementById(
      "lumon-complete-dialog-container"
    );
    if (!container) return;
    document.body.removeChild(container);
  },
};
