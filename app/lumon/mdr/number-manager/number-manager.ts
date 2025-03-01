import { GRID_CONFIG } from "@/app/lumon/mdr/sections/refinement-section/grid-config";
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

  generateNewNumberForPosition(row: number, col: number): MdrNumber {
    return {
      id: `${row}-${col}`,
      row,
      col,
      val: Math.floor(Math.random() * 10),
      // random assign a temper
      temper: ["WO", "FC", "DR", "MA"][Math.floor(Math.random() * 4)] as
        | "WO"
        | "FC"
        | "DR"
        | "MA",
    };
  }
}
