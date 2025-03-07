"use client";

import { BinDataMetrics } from "@/app/lumon/mdr/[file_id]/bin-data";

// Type for the progress data structure in IndexedDB
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
  id?: number;
};

// Type for file progress summary
export type FileProgressSummary = {
  fileId: string;
  completionPercentage: number;
  metrics: {
    wo: number;
    fc: number;
    dr: number;
    ma: number;
  };
};

/**
 * ProgressRetriever
 *
 * A utility class for retrieving MDR progress data from IndexedDB.
 * This class is used to get progress information for all files.
 */
export class ProgressRetriever {
  private readonly DB_NAME = "lumon_mdr_progress";
  private readonly STORE_NAME = "progress_data";
  private readonly VERSION = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Only initialize DB on the client
    if (typeof window === "undefined") return;
    this.dbPromise = this.initDB();
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

  /**
   * Get progress summary for all files
   * @returns Promise with an array of file progress summaries
   */
  async getAllFilesProgress(): Promise<FileProgressSummary[]> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const result = request.result as ProgressData[];
          const data: ProgressData = result[0] || { files: {} };
          const fileProgressSummaries: FileProgressSummary[] = [];

          Object.entries(data.files).forEach(([fileId, fileData]) => {
            // Calculate average metrics across all bins
            let totalBins = 0;
            const aggregatedMetrics = {
              wo: 0,
              fc: 0,
              dr: 0,
              ma: 0,
            };

            Object.values(fileData.progress).forEach((binData) => {
              totalBins++;
              aggregatedMetrics.wo += binData.metrics.wo;
              aggregatedMetrics.fc += binData.metrics.fc;
              aggregatedMetrics.dr += binData.metrics.dr;
              aggregatedMetrics.ma += binData.metrics.ma;
            });

            // Normalize metrics
            if (totalBins > 0) {
              aggregatedMetrics.wo /= totalBins;
              aggregatedMetrics.fc /= totalBins;
              aggregatedMetrics.dr /= totalBins;
              aggregatedMetrics.ma /= totalBins;
            }

            // Calculate overall completion percentage (average of all metrics)
            const completionPercentage =
              totalBins > 0
                ? ((aggregatedMetrics.wo +
                    aggregatedMetrics.fc +
                    aggregatedMetrics.dr +
                    aggregatedMetrics.ma) /
                    4) *
                  100
                : 0;

            fileProgressSummaries.push({
              fileId,
              completionPercentage,
              metrics: aggregatedMetrics,
            });
          });

          resolve(fileProgressSummaries);
        };

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error("Error retrieving file progress:", error);
      return [];
    }
  }

  /**
   * Get progress summary for a specific file
   * @param fileId The ID of the file to get progress for
   * @returns Promise with the file progress summary or null if not found
   */
  async getFileProgress(fileId: string): Promise<FileProgressSummary | null> {
    try {
      const allProgress = await this.getAllFilesProgress();
      return allProgress.find((progress) => progress.fileId === fileId) || null;
    } catch (error) {
      console.error(`Error retrieving progress for file ${fileId}:`, error);
      return null;
    }
  }
}
