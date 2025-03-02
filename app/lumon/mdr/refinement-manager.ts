import { BinData } from "@/app/lumon/mdr/bin-data";
import { NumberManager } from "@/app/lumon/mdr/number-manager";
import { PointerManager } from "@/app/lumon/mdr/pointer-manager";
import { ProgressSaver } from "@/app/lumon/mdr/progress-saver";
import { TemperManager } from "@/app/lumon/mdr/temper-manager";
import { sum } from "lodash";
import { create } from "zustand";

export class RefinementManager {
  private static instance: RefinementManager | null = null;

  readonly fileName: string;
  bins: BinData[];

  readonly numberManager: NumberManager;
  readonly pointerManager: PointerManager;
  readonly temperManager: TemperManager;
  readonly progressSaver: ProgressSaver;
  readonly progress = create<number>(() => 0);
  private _pollingProgressInterval: NodeJS.Timeout;

  private constructor() {
    // Initialize 5 bins
    this.bins = Array.from(
      { length: 5 },
      (_, index) => new BinData(`0${index + 1}`)
    );

    this.fileName = "Cold Harbor";

    this.numberManager = new NumberManager();
    this.pointerManager = new PointerManager();
    this.temperManager = new TemperManager({
      numberManager: this.numberManager,
    });
    this.progressSaver = new ProgressSaver(this.fileName, this.bins);

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
      console.log("Creating RefinementManager");
      RefinementManager.instance = new RefinementManager();
    }
    return RefinementManager.instance;
  }

  static delete() {
    if (!RefinementManager.instance) return;
    console.log("Deleting RefinementManager");
    const instance = RefinementManager.instance;
    instance.pointerManager.removeEventListeners();
    clearInterval(instance._pollingProgressInterval);
    instance.temperManager.stopRandomEvent();
    instance.progressSaver.beforeUnmount();
    RefinementManager.instance = null;
  }

  getBinByIndex(index: number): BinData | undefined {
    return this.bins[index];
  }

  getBinByLabel(label: string): BinData | undefined {
    return this.bins.find((bin) => bin.label === label);
  }
}
