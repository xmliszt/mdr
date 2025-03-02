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

  async assignHighlightedNumbersToBin(bin: BinData) {
    const highlightedNumbers = this.store
      .getState()
      .numbers.filter((n) => n.isHighlighted);

    // Get the number cell elements by id
    const cellNumberAndParentElements = compact(
      highlightedNumbers.map((n) => {
        const cell = document.getElementById(n.id);
        if (!cell) return null;
        const parent = cell.parentElement;
        if (!parent) return null;
        return { cell, parent };
      })
    );

    // Get the bin element by id
    const binElement = document.getElementById(bin.binId);
    if (!binElement) throw new Error(`Bin not found for id: ${bin.binId}`);

    // Get the center position of the bin
    const binBounds = binElement.getBoundingClientRect();
    const binCenterX = binBounds.left + binBounds.width / 2;
    const binCenterY = binBounds.top + 35;

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
    cellNumberAndParentElements.forEach(({ parent }, idx) => {
      // Remove from current position in DOM
      const parentParent = parent.parentElement;
      if (!parentParent) throw new Error(`Parent parent not found`);
      const parentParentRect = parentParent.getBoundingClientRect();
      parentParent.removeChild(parent);

      // Append to body with fixed positioning
      document.body.appendChild(parent);

      // Set position to maintain visual position relative to viewport
      parent.style.left = `${parentParentRect.left}px`;
      parent.style.top = `${parentParentRect.top}px`;
      parent.style.position = "fixed";
      parent.style.zIndex = `${9999 - idx}`;
    });

    // Step 2: Move the cells to the center of the bin, and scale them to 0.5x:
    await new Promise<void>((resolve) => {
      cellNumberAndParentElements.forEach(({ parent, cell }) => {
        parent.style.transition = `all 3s ease-in-out`;
        parent.style.left = `${binCenterX}px`;
        parent.style.top = `${binCenterY}px`;
        parent.style.transform = `translate(0px, 0px) scale(0)`;
        parent.style.opacity = `0`;
        cell.style.transition = `all 3s ease-in-out`;
        cell.style.transform = `translate(
          ${GRID_CONFIG.CELL_SIZE / 2}px,
          ${GRID_CONFIG.CELL_SIZE / 2}px
        ) scale(0)`;
        cell.style.opacity = `0`;
      });
      setTimeout(() => resolve(), 3000);
    });

    // Finally, reset the highlighted numbers in the store
    this._resetHighlightedNumbers(highlightedNumbers);
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
      const cell = document.getElementById(num.id);
      if (!cell) return;
      const parent = cell.parentElement;
      if (!parent) return;
      // Portal parent back to the grid
      const numberGrid = document.getElementById("number_grid");
      if (!numberGrid) throw new Error(`Number grid not found`);
      const parentParent = parent.parentElement;
      if (!parentParent) throw new Error(`Parent parent not found`);
      parentParent.removeChild(parent);
      numberGrid.appendChild(parent);
      parent.style.position = "absolute";
      parent.style.transition = "";
      parent.style.zIndex = "0";
      parent.style.left = "0px";
      parent.style.top = "0px";
      parent.style.opacity = "100%";
      parent.style.transform = `translate(
        ${num.col * GRID_CONFIG.CELL_SIZE}px,
        ${num.row * GRID_CONFIG.CELL_SIZE}px
      ) scale(1)`;

      cell.style.transition = "";
      cell.style.opacity = "100%";
      cell.style.transform = `translate(0px, 0px) scale(1)`;
    });
  }

  get maxRow() {
    return Math.max(...this.store.getState().numbers.map((n) => n.row));
  }

  get maxCol() {
    return Math.max(...this.store.getState().numbers.map((n) => n.col));
  }
}
