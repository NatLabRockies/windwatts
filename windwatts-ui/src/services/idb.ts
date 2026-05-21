/**
 * IndexedDB CRUD service for the windwatts browser database.
 *
 * Add new store names to STORES as the app grows — the DB upgrade step
 * creates any missing object stores automatically.
 */

const DB_NAME = "windwatts";
const DB_VERSION = 1;

export const STORES = {
  CUSTOM_TURBINES: "custom_power_curves",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

function openDB(storeName: StoreName): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB(storeName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet<T>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> {
  const db = await openDB(storeName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(id);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function idbPut<T extends { id: string }>(
  storeName: StoreName,
  value: T
): Promise<void> {
  const db = await openDB(storeName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const req = tx.objectStore(storeName).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbDelete(
  storeName: StoreName,
  id: string
): Promise<void> {
  const db = await openDB(storeName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const req = tx.objectStore(storeName).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
