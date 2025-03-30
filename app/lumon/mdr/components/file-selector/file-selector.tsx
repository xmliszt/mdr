"use client";

import { LumonLink } from "@/app/components/lumon-link";
import { FILES } from "@/app/lumon/mdr/[file_id]/files";
import { InstructionManualModal } from "@/app/lumon/mdr/components/instruction-manual-modal";
import { ProgressImporterExporter } from "@/app/lumon/mdr/components/progress-importer-exporter";
import {
  FileProgressSummary,
  ProgressRetriever,
} from "@/app/lumon/mdr/components/progress-retriever";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import isMobile from "is-mobile";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function FileSelector() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [gridColumns, setGridColumns] = useState(4); // Default value
  const [fileProgress, setFileProgress] = useState<FileProgressSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const progressRetrieverRef = useRef<ProgressRetriever | null>(null);

  // Sort files alphabetically by name
  const sortedFiles = useMemo(() => {
    return Object.entries(FILES)
      .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
      .map(([id, name]) => ({ id, name }));
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    // Navigate to the selected file
    (fileId: string) => router.push(`/lumon/mdr/${fileId}`),
    [router]
  );

  // Detect actual grid columns based on viewport size
  useEffect(() => {
    // Initialize progress retriever
    if (typeof window !== "undefined" && !progressRetrieverRef.current) {
      progressRetrieverRef.current = new ProgressRetriever();

      // Load file progress
      const loadProgress = async () => {
        setIsLoading(true);
        if (progressRetrieverRef.current) {
          try {
            const progress =
              await progressRetrieverRef.current.getAllFilesProgress();
            setFileProgress(progress);
          } catch (error) {
            console.error("Failed to load progress:", error);
          } finally {
            setIsLoading(false);
          }
        }
      };

      loadProgress();
    }

    const updateGridColumns = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      let columns = 1; // Default (mobile)

      // Match the grid classes in the JSX:
      // grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
      if (containerWidth < 640) columns = 1; // Default (< sm)
      else if (containerWidth < 768) columns = 2; // sm breakpoint
      else if (containerWidth < 1024) columns = 3; // md breakpoint
      else if (containerWidth < 1280) columns = 4; // lg breakpoint
      else columns = 5; // xl breakpoint

      setGridColumns(columns);
    };

    // Initial calculation
    updateGridColumns();

    // Update on resize
    window.addEventListener("resize", updateGridColumns);
    return () => window.removeEventListener("resize", updateGridColumns);
  }, []);

  // Find progress for a specific file
  const getFileProgress = useCallback(
    (fileId: string) => {
      return fileProgress.find((progress) => progress.fileId === fileId);
    },
    [fileProgress]
  );

  // Handle click outside to close folders
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedIndex !== null && containerRef.current) {
        // Check if click is inside the grid but not on a folder
        if (containerRef.current.contains(event.target as Node)) {
          const clickedOnFolder = (event.target as Element).closest(
            "[data-folder-item]"
          );
          if (!clickedOnFolder) {
            setSelectedIndex(null);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (keyDownEvent: KeyboardEvent) => {
      const filesCount = sortedFiles.length;

      // If no folder is selected, select the first one
      if (selectedIndex === null) {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
            keyDownEvent.key
          )
        ) {
          keyDownEvent.preventDefault();
          setSelectedIndex(0);
          return;
        }
      }

      // Skip keyboard navigation if no folder is selected
      if (selectedIndex === null) return;
      if (keyDownEvent.key === "ArrowUp") {
        keyDownEvent.preventDefault();
        // Calculate current row and column
        const currentRow = Math.floor(selectedIndex / gridColumns);
        const currentCol = selectedIndex % gridColumns;

        // Calculate the number of items in this column
        const lastRowInColumn = Math.floor((filesCount - 1) / gridColumns);
        console.log(
          selectedIndex,
          gridColumns,
          currentRow,
          currentCol,
          lastRowInColumn
        );

        // Check if there's a row above in the same column
        if (currentRow > 0) {
          // Move up one row in the same column
          setSelectedIndex(selectedIndex - gridColumns);
        } else {
          // Wrap to the bottom of the same column
          // Find the last valid index in this column
          const lastIndexInColumn = Math.min(
            lastRowInColumn * gridColumns + currentCol,
            filesCount - 1
          );
          setSelectedIndex(lastIndexInColumn);
        }
      } else if (keyDownEvent.key === "ArrowDown") {
        keyDownEvent.preventDefault();
        // Calculate current row and column
        const currentRow = Math.floor(selectedIndex / gridColumns);
        const currentCol = selectedIndex % gridColumns;

        // Calculate next index by moving down one row
        const nextIndex = selectedIndex + gridColumns;

        // Check if the next index is valid and in the same column
        if (
          nextIndex < filesCount &&
          Math.floor(nextIndex / gridColumns) > currentRow
        ) {
          // Move down one row in the same column
          setSelectedIndex(nextIndex);
        } else {
          // Wrap to the top of the same column
          // Find the first index in this column
          setSelectedIndex(currentCol);
        }
      } else if (keyDownEvent.key === "ArrowLeft") {
        keyDownEvent.preventDefault();
        const newIndex = (selectedIndex - 1 + filesCount) % filesCount;
        setSelectedIndex(newIndex);
      } else if (keyDownEvent.key === "ArrowRight") {
        keyDownEvent.preventDefault();
        const newIndex = (selectedIndex + 1) % filesCount;
        setSelectedIndex(newIndex);
      } else if (keyDownEvent.key === "Enter" && selectedIndex !== null) {
        handleFileSelect(sortedFiles[selectedIndex].id);
      } else if (keyDownEvent.key === "Escape" && selectedIndex !== null) {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, gridColumns, handleFileSelect, sortedFiles]);

  // Scroll selected file into view when it changes
  useEffect(() => {
    // Use a small timeout to ensure the DOM has updated
    const timeoutId = setTimeout(() => {
      if (selectedIndex === null) return;

      // Use the native scrollIntoView method which works reliably
      const selectedFileElement = document.getElementById(
        `file-${sortedFiles[selectedIndex].id}`
      );
      if (!selectedFileElement) return;

      selectedFileElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }, 50); // Slightly longer timeout to ensure everything is rendered

    return () => clearTimeout(timeoutId);
  }, [selectedIndex, sortedFiles]);

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden gap-y-8">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-foreground">Loading progress data...</div>
        </div>
      )}

      <ScrollArea ref={scrollAreaRef} className="relative h-screen w-full">
        <div
          ref={containerRef}
          className="w-full h-full px-8 py-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center"
        >
          {sortedFiles.map((file, index) => {
            const progress = getFileProgress(file.id);
            const completionPercentage = progress?.completionPercentage || 0;
            const hasProgress = completionPercentage > 0;
            const isSelected = index === selectedIndex;
            const isComplete = completionPercentage >= 100;

            return (
              <motion.div
                id={`file-${file.id}`}
                key={file.id}
                data-folder-item="true"
                className="w-[200px] h-[200px] overflow-hidden flex items-center justify-center"
                onClick={() => {
                  if (isSelected) {
                    handleFileSelect(file.id);
                  } else {
                    setSelectedIndex(index);
                  }
                }}
              >
                <div className="relative w-[150px] h-[150px] transform-3d perspective-midrange backface-hidden will-change-transform translate-z-0">
                  {/* Folder back */}
                  <div
                    className={cn(
                      "w-[180px] h-[100px] rounded-lg",
                      // Center the folder
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                      "shadow-[0_0_10px_rgba(0,0,0,0.2)] transition-all duration-200 ease-out",
                      hasProgress ? "bg-[#1a4a70]" : "bg-[#173a60]"
                    )}
                  />

                  {/* File inside (visible when folder is open) */}
                  <motion.div
                    className={cn(
                      "w-[160px] h-[80px] rounded-sm bg-white",
                      // Center the file
                      "absolute bottom-0 left-1/2 -translate-x-1/2",
                      "shadow-lg transition-all duration-200 ease-out",
                      "backface-visibility-hidden will-change-transform"
                    )}
                    initial={{
                      translateY: 0,
                    }}
                    animate={{
                      translateY: isSelected ? -60 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smoother motion
                    }}
                  >
                    {/* File name */}
                    <div className="absolute top-2 left-2 text-neutral-600 text-xs font-mono [text-shadow:none]">
                      {file.id}
                    </div>
                  </motion.div>

                  {/* Folder front (opens when selected) */}
                  <motion.div
                    className={cn(
                      "w-[180px] h-[110px] rounded-lg",
                      "absolute left-1/2 -translate-x-1/2 bottom-0 origin-bottom",
                      "transition-all duration-200 ease-out",
                      "transform-style-preserve-3d perspective-[800px]",
                      "backface-visibility-hidden will-change-transform",
                      hasProgress ? "bg-[#2d6ca8]" : "bg-[#295a8e]",
                      isSelected
                        ? "shadow-[0_-7px_10px_rgba(0,0,0,0.5)]"
                        : "shadow-[0_0px_5px_rgba(0,0,0,0.3)] hover:shadow-[0_-3px_5px_rgba(0,0,0,0.3)]"
                    )}
                    animate={{
                      rotateX: isSelected ? -30 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smoother motion
                    }}
                    whileHover={{
                      rotateX: isSelected ? -30 : -15,
                    }}
                  >
                    {/* File name */}
                    <div className="absolute bottom-8 w-full text-center text-white font-bold text-lg">
                      {file.name}
                    </div>

                    {/* Progress indicator badge */}
                    {hasProgress && (
                      <div
                        className={cn(
                          "absolute top-2 right-2 size-2 rounded-full",
                          isComplete
                            ? "bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]"
                            : "bg-amber-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]"
                        )}
                      />
                    )}

                    {/* Progress bar */}
                    {hasProgress && (
                      <div className="absolute flex items-center gap-x-1.5 bottom-1.5 left-4 right-4">
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden shadow-md">
                          <div
                            className={
                              isComplete
                                ? "h-full bg-gradient-to-r from-green-500 to-green-300"
                                : "h-full bg-gradient-to-r from-amber-500 to-amber-300"
                            }
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-foreground font-mono">
                          {Math.round(completionPercentage)}%
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Gradient blur top overlay */}
        <div className="absolute top-0 left-0 w-full h-24 backdrop-blur-sm [mask-image:linear-gradient(to_top,transparent,black,black)]" />

        {/* Gradient blur bottom overlay */}
        <div className="absolute bottom-0 left-0 w-full h-24 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black,black)]" />

        {/* Gradient background top overlay */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-t from-transparent to-background" />

        {/* Gradient background bottom overlay */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-background" />
      </ScrollArea>

      {/* Bottom instructions */}
      {!isMobile() && (
        <div className="absolute bottom-4 px-4 left-0 right-0 text-center text-foreground text-opacity-80 py-2">
          Use mouse or arrow keys to navigate. Press <kbd>{`<Enter>`}</kbd> to
          select. Press <kbd>{`<Escape>`}</kbd> to deselect.
        </div>
      )}

      {/* Top link */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <LumonLink redirect="/" />
      </div>

      {/* Top instruction manual */}
      <div
        className={cn(
          "absolute flex items-center gap-x-2 left-4 right-4 top-8",
          isMobile() ? "justify-between" : " justify-end"
        )}
      >
        <ProgressImporterExporter />
        <InstructionManualModal />
      </div>
    </div>
  );
}
