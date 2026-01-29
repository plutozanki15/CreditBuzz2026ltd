const DB_NAME = "zenfi_kv";
const STORE_NAME = "keyval";
const DB_VERSION = 1;

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const req = fn(store);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
};

export const idbGet = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await withStore<T | undefined>("readonly", (s) => s.get(key));
    return (value as T) ?? null;
  } catch {
    return null;
  }
};

export const idbSet = async (key: string, value: unknown): Promise<void> => {
  await withStore("readwrite", (s) => s.put(value as any, key));
};

export const idbDel = async (key: string): Promise<void> => {
  await withStore("readwrite", (s) => s.delete(key));
};
