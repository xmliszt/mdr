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
  temper: "WO" | "FC" | "DR" | "MA";
  /**
   * True if the cell is highlighted by clicking on it.
   */
  isHighlighted: boolean;
};

export class NumberManager {
  /**
   * A grid of numbers, where each number is a MdrNumber
   */
  readonly store = create<{
    numbers: MdrNumber[];
  }>(() => ({
    numbers: [],
  }));

  generateNumbers(gridSize: { w: number; h: number }) {
    const currentNumbers = this.store.getState().numbers;
    const colSize = Math.ceil(gridSize.w / GRID_CONFIG.CELL_SIZE);
    const rowSize = Math.ceil(gridSize.h / GRID_CONFIG.CELL_SIZE);

    // If there are no numbers yet, generate the initial grid
    if (currentNumbers.length === 0) {
      const newNumbers = Array.from({ length: rowSize }).flatMap((_, row) =>
        Array.from({ length: colSize }).map((_, col) =>
          this.generateNewNumberForPosition(row, col)
        )
      );

      this.store.setState({ numbers: newNumbers });
      return;
    }

    // Find the current dimensions
    const currentColSize =
      currentNumbers.length > 0
        ? Math.max(...currentNumbers.map((n) => n.col)) + 1
        : 0;
    const currentRowSize =
      currentNumbers.length > 0
        ? Math.max(...currentNumbers.map((n) => n.row)) + 1
        : 0;

    // Create a new array of numbers based on the new dimensions
    const newNumbers: MdrNumber[] = [];

    // Keep existing numbers that are still within bounds
    newNumbers.push(
      ...currentNumbers.filter((n) => n.col < colSize && n.row < rowSize)
    );

    // Add new numbers for new columns in existing rows
    if (colSize > currentColSize) {
      for (let row = 0; row < Math.min(currentRowSize, rowSize); row++) {
        for (let col = currentColSize; col < colSize; col++) {
          newNumbers.push(this.generateNewNumberForPosition(row, col));
        }
      }
    }

    // Add new numbers for new rows
    if (rowSize > currentRowSize) {
      for (let row = currentRowSize; row < rowSize; row++) {
        for (let col = 0; col < colSize; col++) {
          newNumbers.push(this.generateNewNumberForPosition(row, col));
        }
      }
    }

    this.store.setState({ numbers: newNumbers });
  }

  getNumber(id: string) {
    const n = this.store.getState().numbers.find((n) => n.id === id);
    if (!n) throw new Error(`Number not found for id: ${id}`);
    return n;
  }

  getNumberForPosition(row: number, col: number) {
    const n = this.store
      .getState()
      .numbers.find((n) => n.row === row && n.col === col);
    if (!n) throw new Error(`Number not found for position: ${row}, ${col}`);
    return n;
  }

  generateNewNumberForPosition(row: number, col: number): MdrNumber {
    return {
      id: `${row}-${col}`,
      row,
      col,
      val: Math.floor(Math.random() * 10),
      isHighlighted: false,
      // random assign a temper
      temper: ["WO", "FC", "DR", "MA"][Math.floor(Math.random() * 4)] as
        | "WO"
        | "FC"
        | "DR"
        | "MA",
    };
  }

  highlightNumbers(numbers: MdrNumber[]) {
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

  private _isAssigning = false;

  async assignHighlightedNumbersToBin(bin: BinData) {
    // If the bin is already full, do nothing
    if (
      bin.store.getState().wo === 1 &&
      bin.store.getState().fc === 1 &&
      bin.store.getState().dr === 1 &&
      bin.store.getState().ma === 1
    )
      return;

    if (this._isAssigning) return;
    this._isAssigning = true;

    const highlightedNumbers = this.store
      .getState()
      .numbers.filter((n) => n.isHighlighted)
      .sort((a, b) => a.col - b.col || a.row - b.row);
    if (highlightedNumbers.length === 0) {
      this._isAssigning = false;
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
      });
      setTimeout(() => resolve(), 2000);
    });

    // Finally, reset the highlighted numbers in the store
    this._resetHighlightedNumbers(highlightedNumbers);

    // Wait for the bin's animation to complete (5 seconds in total)
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 4000);
    });

    this._isAssigning = false;
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
                temper: ["WO", "FC", "DR", "MA"][
                  Math.floor(Math.random() * 4)
                ] as "WO" | "FC" | "DR" | "MA",
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
    });
  }

  get maxRow() {
    return Math.max(...this.store.getState().numbers.map((n) => n.row));
  }

  get maxCol() {
    return Math.max(...this.store.getState().numbers.map((n) => n.col));
  }
}
