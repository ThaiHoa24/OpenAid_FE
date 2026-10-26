import { STORAGE_KEYS } from "@/constants";
import { INITIAL_SEED_DATA } from "@/mocks/seedData";
import type { MockDatabase, TransparencyLog } from "@/types";
import { generateId } from "@/utils";

function cloneSeed(): MockDatabase {
  return JSON.parse(JSON.stringify(INITIAL_SEED_DATA));
}

export const storageService = {
  getDb(): MockDatabase {
    if (typeof window === "undefined") {
      return cloneSeed();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.DB);
      if (!raw) {
        const seeded = cloneSeed();
        window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw) as MockDatabase;
    } catch (err) {
      console.error("Failed to read mock DB from localStorage:", err);
      return cloneSeed();
    }
  },

  saveDb(db: MockDatabase): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(db));
      window.dispatchEvent(new Event("openaid-db-changed"));
    } catch (err) {
      console.error("Failed to save mock DB to localStorage:", err);
    }
  },

  resetDb(): MockDatabase {
    const seeded = cloneSeed();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.DB, JSON.stringify(seeded));
      window.dispatchEvent(new Event("openaid-db-changed"));
    }
    return seeded;
  },

  addLog(
    db: MockDatabase,
    entry: Omit<TransparencyLog, "id" | "timestamp"> & { timestamp?: string }
  ): TransparencyLog {
    const newLog: TransparencyLog = {
      ...entry,
      id: generateId("log"),
      timestamp: entry.timestamp || new Date().toISOString(),
    };
    db.transparencyLogs.unshift(newLog);
    return newLog;
  },
};
