"use client";

import { BinDataMetrics } from "@/app/lumon/mdr/[file_id]/bin-data";
import { ProgressRetriever } from "@/app/lumon/mdr/components/progress-retriever";
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
 * ProgressExporter
 *
 * A utility class for exporting MDR progress data from IndexedDB
 * to an encrypted file.
 */
export class ProgressExporter {
  private progressRetriever: ProgressRetriever;

  constructor() {
    this.progressRetriever = new ProgressRetriever();
  }

  /**
   * Generate a random encryption key
   * @returns A random encryption key
   */
  generateEncryptionKey(): string {
    // Generate a random 32-character key
    const randomBytes = CryptoJS.lib.WordArray.random(16);
    return randomBytes.toString(CryptoJS.enc.Hex);
  }

  /**
   * Copy text to clipboard
   * @param text The text to copy to clipboard
   * @returns Promise that resolves when the text is copied
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      throw error;
    }
  }

  /**
   * Export progress data to an encrypted file
   * @returns Promise with the encryption key and a download URL for the encrypted file
   */
  async exportProgress(): Promise<{
    key: string;
    downloadUrl: string;
    fileName: string;
  }> {
    try {
      // Get all progress data from IndexedDB
      const allProgress = await this.progressRetriever.getAllFilesProgress();

      // If there's no progress data, throw an error
      if (!allProgress || allProgress.length === 0) {
        throw new Error("No progress data to export");
      }

      // Get the raw progress data from IndexedDB
      const db = await this.getProgressData();

      if (!db || !db.files || Object.keys(db.files).length === 0) {
        throw new Error("No progress data to export");
      }

      // Generate an encryption key
      const encryptionKey = this.generateEncryptionKey();

      // Encrypt the data
      const jsonData = JSON.stringify(db);
      const encryptedData = CryptoJS.AES.encrypt(
        jsonData,
        encryptionKey
      ).toString();

      // Create a Blob with the encrypted data
      const blob = new Blob([encryptedData], {
        type: "application/octet-stream",
      });

      // Create a download URL for the Blob
      const downloadUrl = URL.createObjectURL(blob);

      // Generate a filename with the current date and time
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const formattedTime = `${String(date.getHours()).padStart(
        2,
        "0"
      )}-${String(date.getMinutes()).padStart(2, "0")}`;
      const fileName = `lumon-mdr-progress-${formattedDate}-${formattedTime}.mdr`;

      return { key: encryptionKey, downloadUrl, fileName };
    } catch (error) {
      console.error("Error exporting progress:", error);
      throw error;
    }
  }

  /**
   * Get the raw progress data from IndexedDB
   * @returns Promise with the raw progress data
   */
  private async getProgressData(): Promise<Omit<ProgressData, "id">> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("lumon_mdr_progress", 1);

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["progress_data"], "readonly");
        const store = transaction.objectStore("progress_data");
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const result = getAllRequest.result;
          if (result && result.length > 0) {
            // Return only the files object without the ID
            resolve({ files: result[0].files });
          } else {
            resolve({ files: {} });
          }
        };

        getAllRequest.onerror = () => {
          reject(new Error("Failed to get progress data"));
        };
      };
    });
  }
}
