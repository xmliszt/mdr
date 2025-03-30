import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Goldman } from "next/font/google";
import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const goldman = Goldman({
  weight: "400",
  subsets: ["latin"],
});

const LINE = "Hello Ms. Cobel";

// Parent animation control for staggering
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1,
    },
  },
};

// Each character animation
const charVariants = {
  hidden: {
    opacity: 0,
    x: "calc(100vw + 100px)", // from right
  },
  visible: (charOrder: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 2,
      delay: charOrder * 0.2,
      ease: "easeOut",
    },
  }),
  exit: (charOrder: number) => ({
    opacity: 0,
    x: "calc(-100vw - 100px)", // to left
    transition: {
      duration: 2,
      delay: charOrder * 0.2,
      ease: "easeIn",
    },
  }),
};

// Screensaver component that displays "Hello Ms. Cobel" in Severance style
type HelloMsCobelScreensaverComponentProps = {
  onClose: () => void;
};

/**
 * Displays "Hello Ms. Cobel" in Severance style.
 * Closes when user clicks, touches, or presses a key.
 * Put this component in the root of your app.
 */
function HelloMsCobelScreensaverComponent({
  onClose,
}: HelloMsCobelScreensaverComponentProps) {
  const [textToShow, setTextToShow] = useState<string | undefined>(LINE);

  // Handle user interaction to close the screensaver
  const handleClose = useCallback(() => onClose(), [onClose]);

  // When user clicks, touches, or presses a key, start exit animation
  useEffect(() => {
    window.addEventListener("keydown", handleClose);
    window.addEventListener("touchstart", handleClose);
    window.addEventListener("click", handleClose);

    return () => {
      window.removeEventListener("keydown", handleClose);
      window.removeEventListener("touchstart", handleClose);
      window.removeEventListener("click", handleClose);
    };
  }, [handleClose]);

  useEffect(() => {
    // Set a delay to start the exit animation after the full line has entered
    const totalEntryTime = LINE.length * 200 + 3000; // delay before exit starts
    const exitTimer = setTimeout(() => {
      setTextToShow(undefined);

      // After exit animation completes, reset the flag so we will loop the animation
      const resetTimer = setTimeout(() => {
        setTextToShow(LINE);
      }, totalEntryTime);

      return () => clearTimeout(resetTimer);
    }, totalEntryTime);

    return () => clearTimeout(exitTimer);
  }, [onClose, textToShow]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[10000] bg-background flex items-center justify-center"
      onMouseMove={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
      onScroll={(event) => event.stopPropagation()}
    >
      <AnimatePresence>
        {typeof textToShow === "string" && (
          <motion.div
            className={cn(
              goldman.className,
              "flex items-center justify-center",
              "text-accent-foreground text-4xl md:text-6xl"
            )}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            {textToShow.split("").map((char, charOrder) => (
              <motion.div
                key={charOrder}
                variants={charVariants}
                custom={charOrder}
                className="select-none"
              >
                {char === " " ? "\u00A0" : char}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Class to manage the screensaver instance
class HelloMsCobelScreenSaver {
  private containerElement: HTMLDivElement | null = null;
  private root: ReturnType<typeof createRoot> | null = null;
  private isVisible = false;

  constructor() {
    // Create container element when class is instantiated
    if (typeof window !== "undefined") {
      this.containerElement = document.createElement("div");
      this.containerElement.id = "hello-ms-cobel-screensaver-container";
      document.body.appendChild(this.containerElement);
      this.root = createRoot(this.containerElement);
    }
  }

  show = () => {
    if (this.isVisible || !this.root) return;
    this.isVisible = true;
    this.root.render(<HelloMsCobelScreensaverComponent onClose={this.hide} />);
  };

  hide = () => {
    if (!this.isVisible || !this.root) return;
    this.isVisible = false;
    this.root.render(null);
  };
}

// Export a singleton instance
export const helloMsCobelScreenSaver = new HelloMsCobelScreenSaver();
