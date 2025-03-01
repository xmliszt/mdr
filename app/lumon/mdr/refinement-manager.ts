import { BinData } from "@/app/lumon/mdr/bin-data";
import { NumberManager } from "@/app/lumon/mdr/number-manager";

export class RefinementManager {
  private static instance: RefinementManager | null = null;

  readonly numberManager: NumberManager;
  readonly bins: ReadonlyArray<BinData>;

  private constructor() {
    // Initialize 5 bins
    this.bins = Array.from(
      { length: 5 },
      (_, index) => new BinData(`0${index + 1}`)
    );

    this.numberManager = new NumberManager();
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
