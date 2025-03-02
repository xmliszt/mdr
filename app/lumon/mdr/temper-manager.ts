import { NumberManager } from "@/app/lumon/mdr/number-manager";

/**
 * Manages the temper of the numbers in the grid.
 * It intermittently chooses one temper and choose one cell in the grid
 * with that temper.
 */
export class TemperManager {
  static readonly CHANCE_OF_EVENT = 0.65;
  static readonly CHANCE_OF_CHAIN = 0.35;
  static readonly EVENT_INTERVAL = 3000;

  private readonly _numberManager: NumberManager;

  constructor(options: { numberManager: NumberManager }) {
    this._numberManager = options.numberManager;
  }

  private _randomEventInterval: NodeJS.Timeout | undefined;

  private _runRandomEvent() {
    // There is a 80% chance that this event will not occur.
    if (Math.random() < TemperManager.CHANCE_OF_EVENT) return;

    // Choose a random location in the grid.
    const row = Math.floor(Math.random() * this._numberManager.maxRow);
    const col = Math.floor(Math.random() * this._numberManager.maxCol);

    // From this number, runs a function that has 50% chance of calling it again.
    // This function will choose left / right / up / down for a number as a target.
    // and choose a temper for that target.
    function assignTemper(
      numberManager: NumberManager,
      row: number,
      col: number,
      direction: "left" | "right" | "up" | "down",
      mustChain = false
    ) {
      const number = numberManager.getNumberForPosition(row, col);
      // If the number already has a temper, do not assign a new temper.
      if (number.temper) return;

      // Choose a random temper.
      const tempers = ["WO", "FC", "DR", "MA"] as const;
      const selectedTemper =
        tempers[Math.floor(Math.random() * tempers.length)];
      numberManager.setTemper(row, col, selectedTemper);

      // Choose a random direction for the chain.
      const directions = ["left", "right", "up", "down"] as const;
      const availableDirections = directions.filter((d) => d !== direction);

      availableDirections.forEach((d) => {
        // There is a chance that this event will chain
        if (Math.random() > TemperManager.CHANCE_OF_CHAIN && !mustChain) return;

        // Calculate the next row and column.
        const nextRow = row + (d === "up" ? -1 : d === "down" ? 1 : 0);
        const nextCol = col + (d === "left" ? -1 : d === "right" ? 1 : 0);

        // Out of bounds, stop.
        if (
          nextRow < 0 ||
          nextRow >= numberManager.maxRow ||
          nextCol < 0 ||
          nextCol >= numberManager.maxCol
        )
          return;

        // Chain to the next number.
        assignTemper(numberManager, nextRow, nextCol, d, false);
      });
    }

    // Assign the temper and start the chain.
    const directions = ["left", "right", "up", "down"] as const;
    const initialDirection =
      directions[Math.floor(Math.random() * directions.length)];
    // First time always chains.
    assignTemper(this._numberManager, row, col, initialDirection, true);
  }

  startRandomEvent() {
    this._randomEventInterval = setInterval(
      () => this._runRandomEvent(),
      TemperManager.EVENT_INTERVAL
    );
  }

  stopRandomEvent() {
    clearInterval(this._randomEventInterval);
  }
}
