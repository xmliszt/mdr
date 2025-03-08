"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2 } from "lucide-react";
import { useCallback, useState } from "react";

type SocialShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
};

export function SocialShareDialog({
  open,
  onOpenChange,
  fileName,
}: SocialShareDialogProps) {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);

  const sharableContent = generateSharableContent(name, fileName);

  const handleShare = useCallback(() => {
    const sharingContent = `${sharableContent}\n\n${generateBinMetrics()}`;
    // Copy to clipboard
    navigator.clipboard.writeText(sharingContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

    // Try to use the Web Share API if available
    if (!navigator.share) return;

    navigator
      .share({ url: "https://lumon-industries.work/", text: sharingContent })
      .catch((error) => console.log("Error sharing:", error));
  }, [sharableContent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Share Your Achievement</DialogTitle>
          <DialogDescription>
            Share your refinement success with your colleagues.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-sm text-right">
              Your name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              maxLength={20}
              onChange={(e) => {
                e.preventDefault();
                setName(e.target.value);
              }}
              placeholder="Enter your name"
              className="col-span-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right text-sm">Data file</div>
            <div className="col-span-3 text-sm font-medium ml-2">
              {fileName}
            </div>
          </div>
        </div>
        <p className="bg-accent p-4 rounded-md text-sm text-accent-foreground">
          {sharableContent}
        </p>
        <DialogFooter className="mt-4">
          <Button onClick={handleShare} className="w-max">
            <Share2 className="mr-1 size-4" />
            {copied ? "Copied to clipboard!" : "Share achievement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function generateRandomByteText(length: number) {
  return Array.from({ length }, () => {
    const randomByte = Math.floor(Math.random() * 256);
    return `0x${randomByte.toString(16).toUpperCase().padStart(2, "0")}`;
  }).join(" ");
}

function generateBinMetrics() {
  const tempers = ["WO", "FC", "DR", "MA"];

  return Array.from({ length: 5 }, (_, i) => {
    const binId = `0${i + 1}`;

    // Generate temper metrics
    const temperMetrics = tempers
      .map((temper) => {
        const randomBytes = generateRandomByteText(1);
        return `${temper}[${randomBytes}]`;
      })
      .join(" ");

    return `${binId}: ${temperMetrics}`;
  }).join("\n");
}

function generateSharableContent(name: string, fileName: string) {
  return `I${
    name ? `, ${name}, ` : " "
  }have successfully completed the refinement of the ${fileName} file as a Macro Data Refiner at Lumon Industries. Praise Kier!`;
}
