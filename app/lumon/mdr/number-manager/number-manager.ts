"use client";

import { lumonNopeDialog } from "@/app/components/lumon-nope-dialog";
import { BinData } from "@/app/lumon/mdr/bin-data";
import { GRID_CONFIG } from "@/app/lumon/mdr/sections/refinement-section/grid-config";
import { compact } from "lodash";
import { create } from "zustand";

export type MdrNumber = {
  /**
   * Unique identifier for the number
   */
  id: string;
  /**
   * Row index of the number
   */
  row: number;
  /**
   * Column index of the number
   */
  col: number;
  /**
   * 0 - 9 single digit
   */
  val: number;
  /**
   * "WO" | "FC" | "DR" | "MA"
   */
  temper: "WO" | "FC" | "DR" | "MA" | undefined;
  /**
   * True if the cell is highlighted by clicking on it.
   */
  isHighlighted: boolean;
};

export type ViewportPosition = {
  startRow: number;
  startCol: number;
};

export class NumberManager {
  /**
   * A grid of numbers, where each number is a MdrNumber
   */
  readonly store = create<{
    numbers: MdrNumber[];
    viewport: ViewportPosition;
  }>(() => ({
    numbers: [],
    viewport: { startRow: 0, startCol: 0 },
  }));

  /**
   * Cache of generated numbers to maintain consistency when revisiting positions
   */
  private numberCache: Map<string, MdrNumber> = new Map();

  /**
   * Generate a unique ID for a cell at a specific position
   * Format: "r{row}c{col}" to handle negative indices properly
   */
  private generateCellId(row: number, col: number): string {
    return `r${row}c${col}`;
  }

  /**
   * Parse a cell ID to extract the row and column
   * Returns null if the ID format is invalid
   */
  private parseCellId(id: string): { row: number; col: number } | null {
    const match = id.match(/^r(-?\d+)c(-?\d+)$/);
    if (!match) return null;

    return {
      row: parseInt(match[1], 10),
      col: parseInt(match[2], 10),
    };
  }

  generateNumbers(gridSize: { w: number; h: number }) {
    const { viewport } = this.store.getState();
    const colSize = Math.ceil(gridSize.w / GRID_CONFIG.CELL_SIZE);
    const rowSize = Math.ceil(gridSize.h / GRID_CONFIG.CELL_SIZE);

    // Calculate the visible range based on viewport position
    const visibleRowStart = viewport.startRow;
    const visibleRowEnd = viewport.startRow + rowSize - 1;
    const visibleColStart = viewport.startCol;
    const visibleColEnd = viewport.startCol + colSize - 1;

    // Create a new array of numbers for the visible area
    const newNumbers: MdrNumber[] = [];

    // Generate numbers for the visible area
    for (let row = visibleRowStart; row <= visibleRowEnd; row++) {
      for (let col = visibleColStart; col <= visibleColEnd; col++) {
        // Calculate the relative position for rendering
        const relativeRow = row - viewport.startRow;
        const relativeCol = col - viewport.startCol;

        // Generate or retrieve the number for this position
        const number = this.getOrCreateNumberForPosition(row, col);

        // Update the relative position for rendering
        newNumbers.push({
          ...number,
          row: relativeRow,
          col: relativeCol,
        });
      }
    }

    this.store.setState({ numbers: newNumbers });
  }

  getNumber(id: string) {
    // First try to find the number in the current viewport
    const n = this.store.getState().numbers.find((n) => n.id === id);
    if (n) return n;

    // If not found, try to parse the ID to get the absolute position
    const position = this.parseCellId(id);
    if (!position) throw new Error(`Invalid number ID format: ${id}`);

    // Get the number from the cache or create a new one
    return this.getOrCreateNumberForPosition(position.row, position.col);
  }

  getNumberForPosition(row: number, col: number) {
    // row and col are already relative to the current viewport
    // so we can use them directly to find the number in the current numbers array
    const n = this.store
      .getState()
      .numbers.find((n) => n.row === row && n.col === col);

    if (!n) throw new Error(`Number not found for position: ${row}, ${col}`);
    return n;
  }

  getAbsolutePosition(
    relativeRow: number,
    relativeCol: number
  ): { row: number; col: number } {
    const { viewport } = this.store.getState();
    return {
      row: relativeRow + viewport.startRow,
      col: relativeCol + viewport.startCol,
    };
  }

  getOrCreateNumberForPosition(row: number, col: number): MdrNumber {
    const cacheKey = this.generateCellId(row, col);

    // Check if we already have this number in the cache
    if (this.numberCache.has(cacheKey)) {
      return this.numberCache.get(cacheKey)!;
    }

    // Generate a new number and store it in the cache
    const newNumber = this.generateNewNumberForPosition(row, col);
    this.numberCache.set(cacheKey, newNumber);
    return newNumber;
  }

  generateNewNumberForPosition(row: number, col: number): MdrNumber {
    return {
      id: this.generateCellId(row, col),
      row,
      col,
      val: Math.floor(Math.random() * 10),
      isHighlighted: false,
      temper: undefined,
    };
  }

  highlightNumbers(numbers: MdrNumber[]) {
    // The numbers passed in are already in the current viewport's coordinate system
    // so we can directly update their highlight state
    this.store.setState({
      numbers: this.store
        .getState()
        .numbers.map((n) =>
          numbers.includes(n)
            ? { ...n, isHighlighted: true }
            : { ...n, isHighlighted: false }
        ),
    });
  }

  /**
   * Move the viewport in the specified direction
   */
  moveViewport(direction: "up" | "down" | "left" | "right") {
    const { viewport } = this.store.getState();

    let newViewport: ViewportPosition;

    switch (direction) {
      case "up":
        newViewport = {
          ...viewport,
          startRow: viewport.startRow - GRID_CONFIG.NAVIGATION_SPEED,
        };
        break;
      case "down":
        newViewport = {
          ...viewport,
          startRow: viewport.startRow + GRID_CONFIG.NAVIGATION_SPEED,
        };
        break;
      case "left":
        newViewport = {
          ...viewport,
          startCol: viewport.startCol - GRID_CONFIG.NAVIGATION_SPEED,
        };
        break;
      case "right":
        newViewport = {
          ...viewport,
          startCol: viewport.startCol + GRID_CONFIG.NAVIGATION_SPEED,
        };
        break;
    }

    this.store.setState({ viewport: newViewport });

    // Regenerate the numbers for the new viewport
    const numberGrid = document.getElementById("number_grid");
    if (numberGrid) {
      const { width, height } = numberGrid.getBoundingClientRect();
      this.generateNumbers({ w: width, h: height });
    }
  }

  private _assigningBins: { [binId: string]: boolean } = {};

  async assignHighlightedNumbersToBin(bin: BinData) {
    // If the bin is already full, do nothing
    if (
      bin.store.getState().wo === 1 &&
      bin.store.getState().fc === 1 &&
      bin.store.getState().dr === 1 &&
      bin.store.getState().ma === 1
    ) {
      lumonNopeDialog.show();
      return;
    }

    if (this._assigningBins[bin.binId]) {
      lumonNopeDialog.show();
      return;
    }

    const highlightedNumbers = this.store
      .getState()
      .numbers.filter((n) => n.isHighlighted)
      .sort((a, b) => a.col - b.col || a.row - b.row);

    // If there are no highlighted numbers, do nothing
    if (highlightedNumbers.length === 0) {
      lumonNopeDialog.show();
      return;
    }

    // If highlighted numbers have no tempers, do nothing
    if (highlightedNumbers.every((n) => n.temper === undefined)) {
      lumonNopeDialog.show();
      return;
    }

    // Get the number cell elements by id
    const numAndCells = compact(
      highlightedNumbers.map((n) => {
        const num = document.getElementById(n.id);
        if (!num) return null;
        const cell = num.parentElement;
        if (!cell) return null;
        return { num, cell };
      })
    );

    // Get the bin element by id
    const binElement = document.getElementById(bin.binId);
    if (!binElement) throw new Error(`Bin not found for id: ${bin.binId}`);

    // Get the center position of the bin
    const binBounds = binElement.getBoundingClientRect();
    const binCenterX = binBounds.x + binBounds.width / 2;
    const binCenterY = binBounds.y;

    // Increment the bin's metrics to start bin's animation:
    // - Entry animation: 3 seconds.
    // - Metrics update animation: 1 second.
    // - Exit animation: 3 seconds.
    // Total: 7 seconds.
    this._assigningBins[bin.binId] = true;
    bin.increment({
      wo: highlightedNumbers.filter((n) => n.temper === "WO").length / 100,
      fc: highlightedNumbers.filter((n) => n.temper === "FC").length / 100,
      dr: highlightedNumbers.filter((n) => n.temper === "DR").length / 100,
      ma: highlightedNumbers.filter((n) => n.temper === "MA").length / 100,
    });

    // Animate the cells to the center of the bin.
    // Step 1: Portal the cells out to the <body>
    const gridContainer = document.getElementById("number_grid");
    if (!gridContainer) throw new Error(`Grid container not found`);
    const gridContainerRect = gridContainer.getBoundingClientRect();

    // Force a reflow to ensure styles are applied immediately
    numAndCells.forEach(({ cell }, idx) => {
      // Set position to maintain visual position relative to viewport
      cell.style.left = `${gridContainerRect.left}px`;
      cell.style.top = `${gridContainerRect.top}px`;
      cell.style.willChange = "transform,opacity,left,top";
      cell.style.transition = "";
      cell.style.position = "fixed";
      cell.style.zIndex = `${9998 - idx}`;

      // Force a reflow to ensure the styles are applied immediately
      // This prevents batching of style changes which can cause visual glitches
      void cell.offsetHeight;
    });

    // Step 2: Move the cells to the center of the bin, and scale them to 0.5x:
    await new Promise<void>((resolve) => {
      numAndCells.forEach(({ cell }) => {
        cell.style.transition = `all 2s ease-in-out`;
        cell.style.left = `${binCenterX}px`;
        cell.style.top = `${binCenterY}px`;
        cell.style.transform = `translate(0px, 0px)`;
        cell.style.opacity = `0`;
        void cell.offsetHeight;
      });
      setTimeout(() => resolve(), 2000);
    });

    // Finally, reset the highlighted numbers in the store
    this._resetHighlightedNumbers(highlightedNumbers);

    // Wait for the bin's animation to complete (5 seconds in total)
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 4000);
    });

    this._assigningBins[bin.binId] = false;
  }

  /**
   * Reset the highlighted numbers in the store.
   * 1. Update the number with new random value, temper, and isHighlighted to false.
   * 2. Restore each number element to its original position.
   */
  private _resetHighlightedNumbers(higlightedNumbers: MdrNumber[]) {
    higlightedNumbers.forEach((num) => {
      // 1. Update the number with new random value, temper, and isHighlighted to false.
      this.store.setState(({ numbers: currentNumbers }) => ({
        numbers: currentNumbers.map((n) =>
          n.id === num.id
            ? {
                ...n,
                val: Math.floor(Math.random() * 10),
                temper: undefined,
                isHighlighted: false,
              }
            : n
        ),
      }));

      // 2. Restore each number element to its original position.
      const numElement = document.getElementById(num.id);
      if (!numElement) return;
      const cell = numElement.parentElement;
      if (!cell) return;
      // Portal parent back to the grid
      cell.style.position = "absolute";
      cell.style.transition = "";
      cell.style.zIndex = "0";
      cell.style.left = "0px";
      cell.style.top = "0px";
      cell.style.opacity = "100%";
      cell.style.transform = `
        translateX(${num.col * GRID_CONFIG.CELL_SIZE}px)
        translateY(${num.row * GRID_CONFIG.CELL_SIZE}px)
      `;
      cell.style.willChange = "";
      void cell.offsetHeight;
    });
  }

  get maxRow() {
    const { numbers } = this.store.getState();
    const relativeMaxRow =
      numbers.length > 0 ? Math.max(...numbers.map((n) => n.row)) : 0;
    return relativeMaxRow;
  }

  get maxCol() {
    const { numbers } = this.store.getState();
    const relativeMaxCol =
      numbers.length > 0 ? Math.max(...numbers.map((n) => n.col)) : 0;
    return relativeMaxCol;
  }

  get viewportPosition(): ViewportPosition {
    return this.store.getState().viewport;
  }

  setTemper(row: number, col: number, temper: "WO" | "FC" | "DR" | "MA") {
    this.store.setState(({ numbers: currentNumbers }) => ({
      numbers: currentNumbers.map((n) =>
        n.row === row && n.col === col ? { ...n, temper } : n
      ),
    }));

    // Also update the cache
    const { viewport } = this.store.getState();
    const absoluteRow = row + viewport.startRow;
    const absoluteCol = col + viewport.startCol;
    const cacheKey = this.generateCellId(absoluteRow, absoluteCol);

    if (this.numberCache.has(cacheKey)) {
      const cachedNumber = this.numberCache.get(cacheKey)!;
      this.numberCache.set(cacheKey, { ...cachedNumber, temper });
    }
  }
}
