import { create } from "zustand";
import { GRID_CONFIG } from "@/app/lumon/mdr/sections/refinement-section/grid-config";

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
    const colSize = Math.ceil(gridSize.w / GRID_CONFIG.CELL_SIZE);
    const rowSize = Math.ceil(gridSize.h / GRID_CONFIG.CELL_SIZE);
    this.store.setState(() => ({
      numbers: Array.from({ length: colSize }).flatMap((_, col) =>
        Array.from({ length: rowSize }).map((_, row) =>
          this.generateNewNumberForPosition(row, col)
        )
      ),
    }));
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
