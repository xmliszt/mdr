"use client";

import { BinData } from "@/app/lumon/mdr/[file_id]/bin-data";
import { NumberManager } from "@/app/lumon/mdr/[file_id]/number-manager";
import { PointerManager } from "@/app/lumon/mdr/[file_id]/pointer-manager";
import { ProgressSaver } from "@/app/lumon/mdr/[file_id]/progress-saver";
import { TemperManager } from "@/app/lumon/mdr/[file_id]/temper-manager";
import { sum } from "lodash";
import { create } from "zustand";

type RefinementManagerOptions = {
  fileId: string;
};

export class RefinementManager {
  readonly fileId: string;
  bins: BinData[];

  readonly numberManager: NumberManager;
  readonly pointerManager: PointerManager;
  readonly temperManager: TemperManager;
  readonly progressSaver: ProgressSaver;
  readonly progress = create<number>(() => 0);
  private _pollingProgressInterval: NodeJS.Timeout | undefined;

  constructor(options: RefinementManagerOptions) {
    // Initialize 5 bins
    this.bins = Array.from(
      { length: 5 },
      (_, index) => new BinData(`0${index + 1}`)
    );

    this.fileId = options.fileId;

    this.numberManager = new NumberManager();
    this.pointerManager = new PointerManager();
    this.temperManager = new TemperManager({
      numberManager: this.numberManager,
    });
    this.progressSaver = new ProgressSaver({
      fileId: this.fileId,
      bins: this.bins,
    });

    this.initializeAllListeners();
  }

  initializeAllListeners() {
    console.log("RefinementManager#init");
    this.progressSaver.restoreBinProgress({
      fileId: this.fileId,
      bins: this.bins,
    });
    this.progressSaver.startPeriodicSaving();
    this.pointerManager.addEventListeners();
    this.temperManager.startRandomEvent();
    this._pollingProgressInterval = setInterval(() => {
      this.progress.setState(
        sum(this.bins.map((bin) => sum(Object.values(bin.store.getState())))) /
          (this.bins.length *
            Object.values(this.bins[0].store.getState()).length)
      );
    }, 1000);
  }

  unmount() {
    console.log("RefinementManager#unmount");
    this.progressSaver.beforeUnmount();
    this.pointerManager.removeEventListeners();
    this.temperManager.stopRandomEvent();
    clearInterval(this._pollingProgressInterval);
  }

  getBinByIndex(index: number): BinData | undefined {
    return this.bins[index];
  }

  getBinByLabel(label: string): BinData | undefined {
    return this.bins.find((bin) => bin.label === label);
  }
}
