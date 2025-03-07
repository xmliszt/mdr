"use client";

import { NumberManager } from "@/app/lumon/mdr/number-manager";
import { v4 } from "uuid";
/**
 * Manages the temper of the numbers in the grid.
 * It intermittently chooses one temper and chooses one cell in the grid
 * with that temper.
 */
export class TemperManager {
  id = v4();
  static readonly CHANCE_OF_EVENT = 0.4;
  static readonly CHANCE_OF_CHAIN = 0.4;
  static readonly EVENT_INTERVAL = 5000;

  private readonly _numberManager: NumberManager;
  private _randomEventInterval: NodeJS.Timeout | undefined;

  constructor(options: { numberManager: NumberManager }) {
    this._numberManager = options.numberManager;
  }

  private _runRandomEvent() {
    // Skip if grid isn’t initialized
    if (this._numberManager.store.getState().numbers.length === 0) {
      console.warn(
        `NumberManager grid not initialized, skipping event. ${this.id}. ${
          this._numberManager.store.getState().numbers
        }`
      );
      return;
    }

    // If there are at least 10% of the numbers with a temper, skip the event
    const { numbers } = this._numberManager.store.getState();
    const numbersWithTemper = numbers.filter((n) => n.temper);
    if (numbersWithTemper.length / numbers.length > 0.1) return;

    // 60% chance to skip the event
    if (Math.random() >= TemperManager.CHANCE_OF_EVENT) return;
  }

  private _assignTemper(
    row: number,
    col: number,
    direction: "left" | "right" | "up" | "down",
    mustChain = false
  ) {
    // Bounds check first
    if (
      row < 0 ||
      row > this._numberManager.maxRow ||
      col < 0 ||
      col > this._numberManager.maxCol
    ) {
      console.warn(`Position out of bounds: (${row}, ${col})`);
      return;
    }

    // Get number, handle failure gracefully
    let number: ReturnType<typeof this._numberManager.getNumberForPosition>;
    try {
      number = this._numberManager.getNumberForPosition(row, col);
    } catch (error) {
      console.warn(`Skipping temper assignment at (${row}, ${col}):`, error);
      return;
    }

    if (number.temper) return; // Skip if temper already assigned

    // Assign a random temper
    const tempers = ["WO", "FC", "DR", "MA"] as const;
    const selectedTemper = tempers[Math.floor(Math.random() * tempers.length)];
    this._numberManager.setTemper(row, col, selectedTemper);

    // Chain to adjacent cells
    const directions = ["left", "right", "up", "down"] as const;
    const availableDirections = directions.filter((d) => d !== direction);

    availableDirections.forEach((d) => {
      if (Math.random() > TemperManager.CHANCE_OF_CHAIN && !mustChain) return;

      const nextRow = row + (d === "up" ? -1 : d === "down" ? 1 : 0);
      const nextCol = col + (d === "left" ? -1 : d === "right" ? 1 : 0);

      if (
        nextRow >= 0 &&
        nextRow <= this._numberManager.maxRow &&
        nextCol >= 0 &&
        nextCol <= this._numberManager.maxCol
      ) {
        this._assignTemper(nextRow, nextCol, d, false);
      }
    });
  }

  startRandomEvent() {
    if (this._randomEventInterval) clearInterval(this._randomEventInterval);
    this._randomEventInterval = setInterval(() => {
      // Run in a separate context to avoid triggering React re-renders directly
      setTimeout(this._runRandomEvent.bind(this), 0);
    }, TemperManager.EVENT_INTERVAL);
  }

  stopRandomEvent() {
    if (this._randomEventInterval) clearInterval(this._randomEventInterval);
  }
}
