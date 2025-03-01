import { BinData } from "./bin-data";

export class RefinementManager {
  private static instance: RefinementManager | null = null;

  readonly bins: ReadonlyArray<BinData>;

  private constructor() {
    // Initialize 5 bins
    this.bins = Array.from(
      { length: 5 },
      (_, index) => new BinData(`0${index + 1}`)
    );
  }

  static get(): RefinementManager {
    if (!RefinementManager.instance) {
      RefinementManager.instance = new RefinementManager();
    }
    return RefinementManager.instance;
  }

  getBinByIndex(index: number): BinData | undefined {
    return this.bins[index];
  }

  getBinByLabel(label: string): BinData | undefined {
    return this.bins.find((bin) => bin.label === label);
  }
}
