"use client"; // Mark this as a Client Component

import { BinData, BinDataMetrics } from "@/app/lumon/mdr/[file_id]/bin-data";

type ProgressData = {
  files: {
    [fileId: string]: {
      progress: {
        [binId: string]: {
          metrics: BinDataMetrics;
        };
      };
    };
  };
};

type ProgressSaverOptions = {
  fileId: string;
  bins: BinData[];
};

/**
 * ProgressSaver
 *
 * A utility class for saving, loading, and managing MDR progress data using IndexedDB.
 *
 * Usage:
 *
 * 1. Create an instance:
 *    ```typescript
 *    const progressSaver = new ProgressSaver();
 *    ```
 *
 * 2. Save progress for a file:
 *    ```typescript
 *    // Create bins with their current state
 *    const bins = [new BinData("AA"), new BinData("AB")];
 *
 *    // Save progress to a named file
 *    await progressSaver.saveProgress({ fileId: "my_session", bins });
 *    ```
 *
 * 3. Restore progress from a saved file:
 *    ```typescript
 *    // Create bins to be populated
 *    const bins = [new BinData("AA"), new BinData("AB")];
 *
 *    // Restore progress from a saved file
 *    const success = await progressSaver.restoreProgress({ fileId: "my_session", bins });
 *    ```
 *
 * 4. List all saved files:
 *    ```typescript
 *    const savedFiles = await progressSaver.listSavedFiles();
 *    // Returns: ["my_session", "another_session", ...]
 *    ```
 */
export class ProgressSaver {
  private readonly DB_NAME = "lumon_mdr_progress";
  private readonly STORE_NAME = "progress_data";
  private readonly VERSION = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private _fileId: string;
  private _bins: BinData[];
  private _periodicSaverInterval: NodeJS.Timeout | undefined;

  constructor(options: ProgressSaverOptions) {
    this._fileId = options.fileId;
    this._bins = options.bins;

    // Only initialize DB on the client
    if (typeof window === "undefined") return;
    this.dbPromise = this.initDB();
  }

  startPeriodicSaving() {
    if (typeof window === "undefined") return; // Do nothing on server
    if (!this.dbPromise) return; // Do nothing if DB isn't initialized

    if (this._periodicSaverInterval) clearInterval(this._periodicSaverInterval);
    this._periodicSaverInterval = setInterval(async () => {
      try {
        await this.saveProgress({
          fileId: this._fileId,
          bins: this._bins,
        });
      } catch (error) {
        console.error("Periodic save failed:", error);
        clearInterval(this._periodicSaverInterval); // Stop on failure
      }
    }, 1000);
  }

  beforeUnmount() {
    if (typeof window === "undefined") return; // Do nothing on server
    this.saveProgress({
      fileId: this._fileId,
      bins: this._bins,
    }).catch((error) => console.error("Unmount save failed:", error));
    if (this._periodicSaverInterval) clearInterval(this._periodicSaverInterval);
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.error("Your browser doesn't support IndexedDB");
        reject(new Error("IndexedDB not supported"));
        return;
      }

      const request = window.indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = (event) => {
        console.error("Database error:", (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
    });
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      if (typeof window === "undefined") {
        return Promise.reject(new Error("Cannot access IndexedDB on server"));
      }
      this.dbPromise = this.initDB();
    }
    return this.dbPromise;
  }

  async saveProgress(options: {
    fileId: string;
    bins: BinData[];
  }): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const existingData: ProgressData = getAllRequest.result[0] || {
          files: {},
        };

        if (!existingData.files[options.fileId]) {
          existingData.files[options.fileId] = { progress: {} };
        }

        options.bins.forEach((bin) => {
          const metrics = bin.store.getState();
          existingData.files[options.fileId].progress[bin.binId] = {
            metrics,
          };
        });

        if (getAllRequest.result[0]) {
          store.put(existingData);
        } else {
          store.add({ ...existingData, id: 1 });
        }
      };

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) =>
          reject((event.target as IDBTransaction).error);
      });
    } catch (error) {
      console.error("Error saving progress:", error);
      throw error;
    }
  }

  private async _loadProgress(options: {
    fileId: string;
  }): Promise<{ [binId: string]: BinDataMetrics } | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const data: ProgressData = request.result[0] || { files: {} };

          if (!data.files[options.fileId]) {
            resolve(null);
            return;
          }

          const binProgress: { [binId: string]: BinDataMetrics } = {};
          Object.entries(data.files[options.fileId].progress).forEach(
            ([binId, binData]) => {
              binProgress[binId] = binData.metrics;
            }
          );

          resolve(binProgress);
        };

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error("Error loading progress:", error);
      throw error;
    }
  }

  async restoreBinProgress(options: {
    fileId: string;
    bins: BinData[];
  }): Promise<boolean> {
    try {
      const progress = await this._loadProgress(options);
      if (!progress) return false;

      options.bins.forEach((bin) => {
        const binProgress = progress[bin.binId];
        if (binProgress) bin.store.setState(binProgress);
      });

      return true;
    } catch (error) {
      console.error("Error restoring bin progress:", error);
      return false;
    }
  }

  async listSavedFiles(): Promise<string[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const data: ProgressData = request.result[0] || { files: {} };
          resolve(Object.keys(data.files));
        };

        request.onerror = () => reject([]);
      });
    } catch (error) {
      console.error("Error listing saved files:", error);
      return [];
    }
  }
}
