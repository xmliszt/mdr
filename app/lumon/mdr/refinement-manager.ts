import { BinData } from "@/app/lumon/mdr/bin-data";
import { NumberManager } from "@/app/lumon/mdr/number-manager";
import { PointerManager } from "@/app/lumon/mdr/pointer-manager";
export class RefinementManager {
  private static instance: RefinementManager | null = null;

  readonly numberManager: NumberManager;
  readonly pointerManager: PointerManager;
  readonly bins: ReadonlyArray<BinData>;

  private constructor() {
    // Initialize 5 bins
    this.bins = Array.from(
      { length: 5 },
      (_, index) => new BinData(`0${index + 1}`)
    );

    this.numberManager = new NumberManager();
    this.pointerManager = new PointerManager();
  }

  static get(): RefinementManager {
    if (!RefinementManager.instance) {
      RefinementManager.instance = new RefinementManager();
    }
    return RefinementManager.instance;
  }

  static delete() {
    if (!RefinementManager.instance) return;
    RefinementManager.instance.pointerManager.removeEventListeners();
    RefinementManager.instance = null;
  }

  getBinByIndex(index: number): BinData | undefined {
    return this.bins[index];
  }

  getBinByLabel(label: string): BinData | undefined {
    return this.bins.find((bin) => bin.label === label);
  }
}
