"use client";

import { LumonLink } from "@/app/components/lumon-link";
import { FILES } from "@/app/lumon/mdr/[file_id]/files";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function FileSelector() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [gridColumns, setGridColumns] = useState(4); // Default value

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
    const container = containerRef.current;

    const updateGridColumns = () => {
      if (!container) return;

      const computedStyle = window.getComputedStyle(container);
      const gridTemplateColumns = computedStyle.getPropertyValue(
        "grid-template-columns"
      );
      const columnsCount = gridTemplateColumns.split(" ").length;

      setGridColumns(columnsCount);
    };

    // Initial calculation
    updateGridColumns();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateGridColumns);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (!container) return;
      resizeObserver.disconnect();
    };
  }, []);

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

        // Find the total number of rows in this column
        const totalRows = Math.ceil(filesCount / gridColumns);

        // Move up one row or wrap to the bottom of the same column
        const newRow = (currentRow - 1 + totalRows) % totalRows;

        // Calculate the new index
        const calculatedIndex = newRow * gridColumns + currentCol;

        // Ensure we don't exceed the file count
        const newIndex =
          calculatedIndex < filesCount ? calculatedIndex : filesCount - 1;

        setSelectedIndex(newIndex);
      } else if (keyDownEvent.key === "ArrowDown") {
        keyDownEvent.preventDefault();
        // Calculate current row and column
        const currentRow = Math.floor(selectedIndex / gridColumns);
        const currentCol = selectedIndex % gridColumns;

        // Find the total number of rows in this column
        const totalRows = Math.ceil(filesCount / gridColumns);

        // Move down one row or wrap to the top of the same column
        const newRow = (currentRow + 1) % totalRows;

        // Calculate the new index
        const calculatedIndex = newRow * gridColumns + currentCol;

        // Ensure we don't exceed the file count
        const newIndex =
          calculatedIndex < filesCount ? calculatedIndex : currentCol;

        setSelectedIndex(newIndex);
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
  }, [selectedIndex]);

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden gap-y-8">
      <ScrollArea ref={scrollAreaRef} className="relative h-screen w-full">
        <div
          ref={containerRef}
          className="w-full h-full px-8 py-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center"
        >
          {sortedFiles.map(({ id, name }, index) => {
            const isSelected = index === selectedIndex;

            return (
              <motion.div
                id={`file-${id}`}
                key={id}
                data-folder-item="true"
                className="w-[200px] h-[200px] overflow-hidden flex items-center justify-center"
                onClick={() => {
                  if (isSelected) {
                    handleFileSelect(id);
                  } else {
                    setSelectedIndex(index);
                  }
                }}
              >
                <div
                  className="relative w-[150px] h-[150px]"
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "800px",
                  }}
                >
                  {/* Folder back */}
                  <div
                    className={cn(
                      "w-[180px] h-[100px] rounded-lg bg-[#173a60]",
                      // Center the folder
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                      "shadow-[0_0_10px_rgba(0,0,0,0.2)] transition-all duration-200 ease-out"
                    )}
                  />

                  {/* File inside (visible when folder is open) */}
                  <motion.div
                    className={cn(
                      "w-[160px] h-[80px] rounded-sm bg-white",
                      // Center the file
                      "absolute bottom-0 left-1/2 -translate-x-1/2",
                      "shadow-lg transition-all duration-200 ease-out"
                    )}
                    initial={{
                      translateY: 0,
                    }}
                    animate={{
                      translateY: isSelected ? -60 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                  >
                    {/* File name */}
                    <div className="absolute top-2 left-2 text-neutral-600 text-xs font-mono [text-shadow:none]">
                      {id}
                    </div>
                  </motion.div>

                  {/* Folder front (opens when selected) */}
                  <motion.div
                    className={cn(
                      "w-[180px] h-[110px] bg-[#295a8e] rounded-lg",
                      "absolute left-1/2 -translate-x-1/2 bottom-0 origin-bottom",
                      "transition-all duration-200 ease-out",
                      "transform-style-preserve-3d",
                      isSelected
                        ? "shadow-[0_-7px_10px_rgba(0,0,0,0.5)]"
                        : "shadow-[0_0px_5px_rgba(0,0,0,0.3)] hover:shadow-[0_-3px_5px_rgba(0,0,0,0.3)]"
                    )}
                    animate={{
                      rotateX: isSelected ? -30 : 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      rotateX: isSelected ? -30 : -15,
                    }}
                  >
                    {/* File name */}
                    <div className="absolute bottom-4 w-full text-center text-white font-bold text-lg">
                      {name}
                    </div>
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
      <div className="absolute bottom-4 left-0 right-0 text-center text-foreground text-opacity-80 py-2">
        Use mouse wheel or arrow keys to navigate. Press Enter to select. Press
        Escape to deselect.
      </div>

      {/* Top left link */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <LumonLink redirect="/" />
      </div>
    </div>
  );
}
