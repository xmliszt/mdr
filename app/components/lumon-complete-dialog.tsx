"use client";

import { SocialShareDialog } from "@/app/components/social-share-dialog";
import { FILES } from "@/app/lumon/mdr/[file_id]/files";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type LumonCompleteDialogProps = {
  onClose: () => void;
  fileId: string;
};

export function LumonCompleteDialog({
  onClose,
  fileId,
}: LumonCompleteDialogProps) {
  const [open, setOpen] = useState(true);
  const [showPercentage, setShowPercentage] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const fileName = FILES[fileId] || "Unknown";

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose();
  }, [onClose]);

  // Handle Escape key to close the dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  // Timer to transition from percentage to video
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPercentage(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px] [@media(max-width:768px)]:max-w-[90vw] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Refinement 100% Complete
            </DialogTitle>
            <DialogDescription>
              Congratulations on completing the refinement of the {fileName}{" "}
              file. By refining the data file, you have brought glory to this
              company and to Kier.
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
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowShareDialog(true)}>
              <Share2 className="mr-1 size-4" />
              Share my achievement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SocialShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        fileName={fileName}
      />
    </>
  );
}

export const lumonCompleteDialog = {
  show: (fileId: string) => {
    // If the dialog is already open, do nothing
    if (document.getElementById("lumon-complete-dialog-container")) return;

    // Create the container element
    const container = document.createElement("div");
    container.id = "lumon-complete-dialog-container";
    document.body.appendChild(container);

    // Create the root element
    const root = createRoot(container);
    root.render(
      <LumonCompleteDialog
        fileId={fileId}
        onClose={() => lumonCompleteDialog.hide()}
      />
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
