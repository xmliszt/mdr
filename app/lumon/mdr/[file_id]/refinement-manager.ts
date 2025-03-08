"use client";

import { lumonCompleteDialog } from "@/app/components/lumon-complete-dialog";
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
  private _isFileComplete = false;

  constructor(options: RefinementManagerOptions) {
    // Initialize 5 bins
    this.bins = Array.from(
      { length: 5 },
      (_, index) => new BinData(`0${index + 1}`)
    );

    this.fileId = options.fileId;

    this.numberManager = new NumberManager(this);
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
    this.temperManager.startRandomEvent();
    this._pollingProgressInterval = setInterval(() => {
      const totalProgress =
        sum(this.bins.map((bin) => sum(Object.values(bin.store.getState())))) /
        (this.bins.length *
          Object.values(this.bins[0].store.getState()).length);

      this.progress.setState(totalProgress);

      // Check if file is complete (100% progress)
      if (totalProgress >= 1 && !this._isFileComplete) {
        this._isFileComplete = true;
        this.handleFileComplete();
      }
    }, 1000);
  }

  handleFileComplete() {
    // Stop temper assignment
    this.temperManager.stopRandomEvent();

    // Clear temper from all numbers
    const { numbers } = this.numberManager.store.getState();
    numbers.forEach((number) => {
      if (number.temper) {
        const { relativeRow, relativeCol } =
          this.numberManager.getRelativePosition(
            number.absoluteRow,
            number.absoluteCol
          );
        this.numberManager.clearTemper(relativeRow, relativeCol);
      }
    });

    // Show completion dialog
    lumonCompleteDialog.show();
  }

  unmount() {
    console.log("RefinementManager#unmount");
    this.progressSaver.beforeUnmount();
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
