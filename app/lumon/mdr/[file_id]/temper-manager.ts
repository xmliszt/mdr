"use client";

import { NumberManager } from "@/app/lumon/mdr/[file_id]/number-manager";
import { v4 } from "uuid";
/**
 * Manages the temper of the numbers in the grid.
 * It intermittently chooses one temper and chooses one cell in the grid
 * with that temper.
 */
export class TemperManager {
  id = v4();
  /**
   * The chance of an event happening.
   */
  static readonly CHANCE_OF_EVENT = 0.5;
  /**
   * The chance of a chain happening.
   */
  static readonly CHANCE_OF_CHAIN = 0.35;
  /**
   * The interval of the event.
   */
  static readonly EVENT_INTERVAL = 5000;
  /**
   * The maximum percentage of visible numbers with a temper that will be
   * allowed before the event is skipped.
   */
  static readonly MAX_PERCENTAGE_OF_VISIBLE_NUMBERS_WITH_TEMPER = 0.05;

  private readonly _numberManager: NumberManager;
  private _randomEventInterval: NodeJS.Timeout | undefined;
  private _isActive: boolean = true;

  constructor(options: { numberManager: NumberManager }) {
    this._numberManager = options.numberManager;
  }

  private _runRandomEvent() {
    // Skip if grid isn't initialized or if temper assignment is stopped
    if (!this._isActive) return;

    const { numbers } = this._numberManager.store.getState();
    if (numbers.length === 0) {
      console.warn(
        `NumberManager grid not initialized, skipping event. ${this.id}. ${numbers}`
      );
      return;
    }

    // If there are at least 10% of the visible numbers with a temper, skip the event
    // Only consider numbers that are currently visible in the viewport
    const numbersWithTemper = numbers.filter((n) => n.temper);
    if (numbersWithTemper.length / numbers.length > 0.1) return;

    // Chance to skip the event
    if (Math.random() >= TemperManager.CHANCE_OF_EVENT) return;

    // Choose a random visible cell to start the temper assignment
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const randomNumber = numbers[randomIndex];

    // Get the relative position for the visible cell
    const { relativeRow, relativeCol } =
      this._numberManager.getRelativePosition(
        randomNumber.absoluteRow,
        randomNumber.absoluteCol
      );

    // Use the relative row and column for the visible cell
    this._assignTemper(relativeRow, relativeCol, "none", true);
  }

  private _assignTemper(
    relativeRow: number,
    relativeCol: number,
    direction: "left" | "right" | "up" | "down" | "none",
    mustChain = false
  ) {
    // Skip if temper assignment is stopped
    if (!this._isActive) return;

    // Bounds check using relative coordinates (only visible cells)
    if (
      relativeRow < 0 ||
      relativeRow > this._numberManager.maxRelativeRow ||
      relativeCol < 0 ||
      relativeCol > this._numberManager.maxRelativeCol
    ) {
      console.warn(`Position out of bounds: (${relativeRow}, ${relativeCol})`);
      return;
    }

    // If overall visible viewport numbers with temper is greater than the allowed max, skip
    const numbersWithTemper = this._numberManager.store
      .getState()
      .numbers.filter((n) => n.temper);
    if (
      numbersWithTemper.length /
        this._numberManager.store.getState().numbers.length >
      TemperManager.MAX_PERCENTAGE_OF_VISIBLE_NUMBERS_WITH_TEMPER
    ) {
      return;
    }

    // Get number, handle failure gracefully
    let number: ReturnType<
      typeof this._numberManager.getNumberForRelativePosition
    >;
    try {
      number = this._numberManager.getNumberForRelativePosition(
        relativeRow,
        relativeCol
      );
    } catch (error) {
      console.warn(
        `Skipping temper assignment at (${relativeRow}, ${relativeCol}):`,
        error
      );
      return;
    }

    if (number.temper) return; // Skip if temper already assigned

    // Assign a random temper
    const tempers = ["WO", "FC", "DR", "MA"] as const;
    const selectedTemper = tempers[Math.floor(Math.random() * tempers.length)];
    this._numberManager.setTemper(relativeRow, relativeCol, selectedTemper);

    // Chain to adjacent cells
    const directions = ["left", "right", "up", "down"] as const;
    // Fix: When direction is "none", we should consider all directions
    // When direction is a specific direction, we should exclude that direction (to avoid going back)
    const availableDirections =
      direction === "none"
        ? directions
        : directions.filter((d) => d !== direction);

    availableDirections.forEach((d) => {
      // Fix: Adjust the probability check to make chaining more likely
      // If mustChain is true, we should always chain at least in one direction
      const shouldChain =
        mustChain || Math.random() <= TemperManager.CHANCE_OF_CHAIN;
      if (!shouldChain) return;

      const nextRow = relativeRow + (d === "up" ? -1 : d === "down" ? 1 : 0);
      const nextCol = relativeCol + (d === "left" ? -1 : d === "right" ? 1 : 0);

      // Only chain to cells that are visible in the viewport
      if (
        nextRow >= 0 &&
        nextRow <= this._numberManager.maxRelativeRow &&
        nextCol >= 0 &&
        nextCol <= this._numberManager.maxRelativeCol
      ) {
        // Pass false for mustChain to subsequent calls to avoid forced chaining beyond the first level
        this._assignTemper(nextRow, nextCol, d, false);
      }
    });
  }

  startRandomEvent() {
    this._isActive = true;
    if (this._randomEventInterval) clearInterval(this._randomEventInterval);
    this._randomEventInterval = setInterval(() => {
      // Run in a separate context to avoid triggering React re-renders directly
      setTimeout(this._runRandomEvent.bind(this), 0);
    }, TemperManager.EVENT_INTERVAL);
  }

  stopRandomEvent() {
    this._isActive = false;
    if (this._randomEventInterval) clearInterval(this._randomEventInterval);
  }
}
