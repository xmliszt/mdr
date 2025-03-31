"use client";

import { lumonHundredPercentDialog } from "@/app/components/lumon-hundred-percent-dialog";
import { lumonNopeDialog } from "@/app/components/lumon-nope-dialog";
import { BinData } from "@/app/lumon/mdr/[file_id]/bin-data";
import { RefinementManager } from "@/app/lumon/mdr/[file_id]/refinement-manager";
import { GRID_CONFIG } from "@/app/lumon/mdr/[file_id]/sections/refinement-section/grid-config";
import { compact } from "lodash";
import { create } from "zustand";

export type MdrNumber = {
  /**
   * Unique identifier for the number
   */
  id: string;
  /**
   * Absolute row index of the number in the infinite grid
   */
  absoluteRow: number;
  /**
   * Absolute column index of the number in the infinite grid
   */
  absoluteCol: number;
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

  private readonly _refinementManager: RefinementManager;

  constructor(refinementManager: RefinementManager) {
    this._refinementManager = refinementManager;
  }

  /**
   * Cache of generated numbers to maintain consistency when revisiting positions
   */
  private numberCache: Map<string, MdrNumber> = new Map();

  /**
   * Generate a unique ID for a cell at a specific absolute position
   * Format: "r{absoluteRow}c{absoluteCol}" to handle negative indices properly
   */
  private generateCellId(absoluteRow: number, absoluteCol: number): string {
    return `r${absoluteRow}c${absoluteCol}`;
  }

  /**
   * Parse a cell ID to extract the absolute row and column
   * Returns null if the ID format is invalid
   */
  private parseCellId(
    id: string
  ): { absoluteRow: number; absoluteCol: number } | null {
    const match = id.match(/^r(-?\d+)c(-?\d+)$/);
    if (!match) return null;

    return {
      absoluteRow: parseInt(match[1], 10),
      absoluteCol: parseInt(match[2], 10),
    };
  }

  /**
   * Get the relative position of a number based on the current viewport
   */
  getRelativePosition(
    absoluteRow: number,
    absoluteCol: number
  ): { relativeRow: number; relativeCol: number } {
    const { viewport } = this.store.getState();
    return {
      relativeRow: absoluteRow - viewport.startRow,
      relativeCol: absoluteCol - viewport.startCol,
    };
  }

  /**
   * Get the absolute position from a relative position
   */
  getAbsolutePosition(
    relativeRow: number,
    relativeCol: number
  ): { absoluteRow: number; absoluteCol: number } {
    const { viewport } = this.store.getState();
    return {
      absoluteRow: relativeRow + viewport.startRow,
      absoluteCol: relativeCol + viewport.startCol,
    };
  }

  generateNumbers(gridSize: { w: number; h: number }) {
    const { viewport } = this.store.getState();
    const colSize = Math.ceil(gridSize.w / GRID_CONFIG.CELL_SIZE);
    const rowSize = Math.ceil(gridSize.h / GRID_CONFIG.CELL_SIZE);

    // Calculate the visible range based on viewport position
    const visibleAbsoluteRowStart = viewport.startRow;
    const visibleAbsoluteRowEnd = viewport.startRow + rowSize - 1;
    const visibleAbsoluteColStart = viewport.startCol;
    const visibleAbsoluteColEnd = viewport.startCol + colSize - 1;

    // Create a new array of numbers for the visible area
    const newNumbers: MdrNumber[] = [];

    // Generate numbers for the visible area
    for (
      let absoluteRow = visibleAbsoluteRowStart;
      absoluteRow <= visibleAbsoluteRowEnd;
      absoluteRow++
    ) {
      for (
        let absoluteCol = visibleAbsoluteColStart;
        absoluteCol <= visibleAbsoluteColEnd;
        absoluteCol++
      ) {
        // Generate or retrieve the number for this position
        const number = this._getOrCreateNumberForAbsolutePosition(
          absoluteRow,
          absoluteCol
        );
        newNumbers.push(number);
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
    return this._getOrCreateNumberForAbsolutePosition(
      position.absoluteRow,
      position.absoluteCol
    );
  }

  getNumberForRelativePosition(relativeRow: number, relativeCol: number) {
    // Convert relative position to absolute position
    const { absoluteRow, absoluteCol } = this.getAbsolutePosition(
      relativeRow,
      relativeCol
    );

    // Try to find the number in the current viewport
    const n = this.store
      .getState()
      .numbers.find(
        (n) => n.absoluteRow === absoluteRow && n.absoluteCol === absoluteCol
      );

    if (!n)
      throw new Error(
        `Number not found for relative position: ${relativeRow}, ${relativeCol}`
      );
    return n;
  }

  private _getOrCreateNumberForAbsolutePosition(
    absoluteRow: number,
    absoluteCol: number
  ): MdrNumber {
    const cacheKey = this.generateCellId(absoluteRow, absoluteCol);

    // Check if we already have this number in the cache
    if (this.numberCache.has(cacheKey)) {
      return this.numberCache.get(cacheKey)!;
    }

    // Generate a new number and store it in the cache
    const newNumber = this._generateNewNumberForAbsolutePosition(
      absoluteRow,
      absoluteCol
    );
    this.numberCache.set(cacheKey, newNumber);
    return newNumber;
  }

  private _generateNewNumberForAbsolutePosition(
    absoluteRow: number,
    absoluteCol: number
  ): MdrNumber {
    return {
      id: this.generateCellId(absoluteRow, absoluteCol),
      absoluteRow,
      absoluteCol,
      val: Math.floor(Math.random() * 10),
      isHighlighted: false,
      temper: undefined,
    };
  }

  highlightNumbers(numbers: MdrNumber[]) {
    // The numbers passed in are already in the current viewport's coordinate system
    // so we can directly update their highlight state
    const currentNumbers = this.store.getState().numbers;
    const numberIds = new Set(numbers.map((n) => n.id));

    // Only update numbers whose highlight state needs to change
    const updatedNumbers = currentNumbers.map((n) => {
      const shouldBeHighlighted = numberIds.has(n.id);
      if (shouldBeHighlighted === n.isHighlighted) {
        // No change needed, return the same object reference
        return n;
      }
      // Only create new objects for numbers that need to change
      return { ...n, isHighlighted: shouldBeHighlighted };
    });

    // Only update state if there were actual changes
    if (updatedNumbers.some((n, i) => n !== currentNumbers[i])) {
      this.store.setState({ numbers: updatedNumbers });
    }
  }

  /**
   * Move the viewport in the specified direction
   */
  moveViewport(direction: "up" | "down" | "left" | "right") {
    // If assigning any bin, do nothing
    if (Object.values(this._assigningBins).some((isAssigning) => isAssigning))
      return;

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
    if (!numberGrid) throw new Error(`Number grid not found`);
    const { width, height } = numberGrid.getBoundingClientRect();
    this.generateNumbers({ w: width, h: height });
  }

  private _assigningBins: { [binId: string]: boolean } = {};
  // Add new private map to track numbers being assigned
  private _numbersBeingAssigned: Set<string> = new Set();

  get isAllNumbersComplete() {
    const bins = this._refinementManager.bins;
    return bins.every(
      (bin) =>
        bin.store.getState().wo === 1 &&
        bin.store.getState().fc === 1 &&
        bin.store.getState().dr === 1 &&
        bin.store.getState().ma === 1
    );
  }

  get lumonBlockingDialog() {
    if (this.isAllNumbersComplete) {
      return lumonHundredPercentDialog;
    }
    return lumonNopeDialog;
  }

  async assignHighlightedNumbersToBin(bin: BinData) {
    // Check if the bin is already full (all tempers at 100%)
    const binState = bin.store.getState();
    const isBinFull =
      binState.wo === 1 &&
      binState.fc === 1 &&
      binState.dr === 1 &&
      binState.ma === 1;

    if (isBinFull) {
      this.lumonBlockingDialog.show();
      return;
    }

    if (this._assigningBins[bin.binId]) {
      this.lumonBlockingDialog.show();
      return;
    }

    const highlightedNumbers = this.store
      .getState()
      .numbers.filter((n) => n.isHighlighted)
      .sort((a, b) => {
        // Sort by relative position for consistent animation
        const aPos = this.getRelativePosition(a.absoluteRow, a.absoluteCol);
        const bPos = this.getRelativePosition(b.absoluteRow, b.absoluteCol);
        return (
          aPos.relativeCol - bPos.relativeCol ||
          aPos.relativeRow - bPos.relativeRow
        );
      });

    // If there are no highlighted numbers, do nothing
    if (highlightedNumbers.length === 0) {
      this.lumonBlockingDialog.show();
      return;
    }

    // If any of the numbers being assigned are already being assigned, do nothing
    if (highlightedNumbers.some((n) => this._numbersBeingAssigned.has(n.id))) {
      this.lumonBlockingDialog.show();
      return;
    }

    // If highlighted numbers have no tempers, do nothing
    if (highlightedNumbers.every((n) => n.temper === undefined)) {
      this.lumonBlockingDialog.show();
      return;
    }

    // Add the numbers being assigned to the set
    highlightedNumbers.forEach((n) => this._numbersBeingAssigned.add(n.id));

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
    const binCenterX = binBounds.x + binBounds.width / 2 - 15;
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

    // Reset the bin's metrics
    this._assigningBins[bin.binId] = false;

    // Remove the numbers being assigned from the set
    highlightedNumbers.forEach((n) => this._numbersBeingAssigned.delete(n.id));
  }

  /**
   * Reset the highlighted numbers in the store.
   * 1. Update the number with new random value, temper, and isHighlighted to false.
   * 2. Restore each number element to its original position.
   */
  private _resetHighlightedNumbers(higlightedNumbers: MdrNumber[]) {
    higlightedNumbers.forEach((num) => {
      const newNumber = this._generateNewNumberForAbsolutePosition(
        num.absoluteRow,
        num.absoluteCol
      );
      // Update cache
      const cacheKey = this.generateCellId(num.absoluteRow, num.absoluteCol);
      this.numberCache.set(cacheKey, newNumber);

      // Update the number with new random value, temper, and isHighlighted to false.
      this.store.setState(({ numbers: currentNumbers }) => ({
        numbers: currentNumbers.map((n) => (n.id === num.id ? newNumber : n)),
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

      // Calculate relative position for rendering
      const { relativeRow, relativeCol } = this.getRelativePosition(
        num.absoluteRow,
        num.absoluteCol
      );

      cell.style.transform = `
        translateX(${relativeCol * GRID_CONFIG.CELL_SIZE}px)
        translateY(${relativeRow * GRID_CONFIG.CELL_SIZE}px)
      `;
      cell.style.willChange = "";
      void cell.offsetHeight;
    });
  }

  get maxRelativeRow() {
    const { numbers, viewport } = this.store.getState();
    if (numbers.length === 0) return 0;

    // Calculate the maximum relative row based on absolute positions
    const maxRelativeRow = Math.max(
      ...numbers.map((n) => n.absoluteRow - viewport.startRow)
    );
    return maxRelativeRow;
  }

  get maxRelativeCol() {
    const { numbers, viewport } = this.store.getState();
    if (numbers.length === 0) return 0;

    // Calculate the maximum relative column based on absolute positions
    const maxRelativeCol = Math.max(
      ...numbers.map((n) => n.absoluteCol - viewport.startCol)
    );
    return maxRelativeCol;
  }

  get viewportPosition(): ViewportPosition {
    return this.store.getState().viewport;
  }

  setTemper(
    relativeRow: number,
    relativeCol: number,
    temper: "WO" | "FC" | "DR" | "MA"
  ) {
    // Convert relative position to absolute position
    const { absoluteRow, absoluteCol } = this.getAbsolutePosition(
      relativeRow,
      relativeCol
    );

    this.store.setState(({ numbers: currentNumbers }) => ({
      numbers: currentNumbers.map((n) =>
        n.absoluteRow === absoluteRow && n.absoluteCol === absoluteCol
          ? { ...n, temper }
          : n
      ),
    }));

    // Also update the cache
    const cacheKey = this.generateCellId(absoluteRow, absoluteCol);

    if (this.numberCache.has(cacheKey)) {
      const cachedNumber = this.numberCache.get(cacheKey)!;
      this.numberCache.set(cacheKey, { ...cachedNumber, temper });
    }
  }

  clearTemper(relativeRow: number, relativeCol: number) {
    // Convert relative position to absolute position
    const { absoluteRow, absoluteCol } = this.getAbsolutePosition(
      relativeRow,
      relativeCol
    );

    this.store.setState(({ numbers: currentNumbers }) => ({
      numbers: currentNumbers.map((n) =>
        n.absoluteRow === absoluteRow && n.absoluteCol === absoluteCol
          ? { ...n, temper: undefined }
          : n
      ),
    }));

    // Also update the cache
    const cacheKey = this.generateCellId(absoluteRow, absoluteCol);

    if (this.numberCache.has(cacheKey)) {
      const cachedNumber = this.numberCache.get(cacheKey)!;
      this.numberCache.set(cacheKey, { ...cachedNumber, temper: undefined });
    }
  }
}
