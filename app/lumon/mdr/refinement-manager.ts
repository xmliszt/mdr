import { BinData } from "@/app/lumon/mdr/bin-data";
import { NumberManager } from "@/app/lumon/mdr/number-manager";
import { PointerManager } from "@/app/lumon/mdr/pointer-manager";
import { TemperManager } from "@/app/lumon/mdr/temper-manager";
import { sum } from "lodash";
import { create } from "zustand";
export class RefinementManager {
  private static instance: RefinementManager | null = null;

  readonly numberManager: NumberManager;
  readonly pointerManager: PointerManager;
  readonly temperManager: TemperManager;
  readonly bins: ReadonlyArray<BinData>;

  readonly progress = create<number>(() => 0);
  private _pollingProgressInterval: NodeJS.Timeout;

  private constructor() {
    // Initialize 5 bins
    this.bins = Array.from(
      { length: 5 },
      (_, index) => new BinData(`0${index + 1}`)
    );

    this.numberManager = new NumberManager();
    this.pointerManager = new PointerManager();
    this.temperManager = new TemperManager({
      numberManager: this.numberManager,
    });

    this._pollingProgressInterval = setInterval(() => {
      this.progress.setState(
        sum(this.bins.map((bin) => sum(Object.values(bin.store.getState())))) /
          (this.bins.length *
            Object.values(this.bins[0].store.getState()).length)
      );
    }, 1000);

    this.temperManager.startRandomEvent();
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
    clearInterval(RefinementManager.instance._pollingProgressInterval);
    RefinementManager.instance.temperManager.stopRandomEvent();
    RefinementManager.instance = null;
  }

  getBinByIndex(index: number): BinData | undefined {
    return this.bins[index];
  }

  getBinByLabel(label: string): BinData | undefined {
    return this.bins.find((bin) => bin.label === label);
  }
}