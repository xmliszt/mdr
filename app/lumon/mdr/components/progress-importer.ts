"use client";

import { BinDataMetrics } from "@/app/lumon/mdr/[file_id]/bin-data";
import CryptoJS from "crypto-js";

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

/**
 * ProgressImporter
 *
 * A utility class for importing MDR progress data from an encrypted file
 * and writing it to IndexedDB.
 */
export class ProgressImporter {
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
   * Decrypt and import progress data from an encrypted file
   * @param encryptedData The encrypted data from the .mdr file
   * @param decryptionKey The key used to decrypt the data
   * @returns Promise that resolves to true if import was successful, false otherwise
   */
  async importProgress(
    encryptedData: string,
    decryptionKey: string
  ): Promise<boolean> {
    try {
      // Decrypt the data
      const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        console.error("Failed to decrypt data. Invalid key or corrupted data.");
        return false;
      }

      // Parse the decrypted JSON data
      const progressData: ProgressData = JSON.parse(decryptedData);

      // Write to IndexedDB
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);

      // Get existing data
      return new Promise((resolve, reject) => {
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const existingData: ProgressData = getAllRequest.result[0] || {
            files: {},
          };

          // Merge the imported data with existing data
          // This will overwrite any existing files with the same ID
          existingData.files = {
            ...existingData.files,
            ...progressData.files,
          };

          // Save back to IndexedDB
          if (getAllRequest.result[0]) {
            store.put(existingData);
          } else {
            store.add({ ...existingData, id: 1 });
          }

          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () =>
            reject(new Error("Failed to save imported data"));
        };

        getAllRequest.onerror = () =>
          reject(new Error("Failed to get existing data"));
      });
    } catch (error) {
      console.error("Error importing progress:", error);
      return false;
    }
  }
}
