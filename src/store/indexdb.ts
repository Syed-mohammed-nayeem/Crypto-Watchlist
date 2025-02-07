// indexedDB-utils.ts

export const openDB = (name: string, version: number) => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name, version);
  
      request.onsuccess = (event) => resolve((event.target as IDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
  
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains("watchlists")) {
          const store = db.createObjectStore("watchlists", { keyPath: "id" });
          store.createIndex("name", "name", { unique: true });
        }
      };
    });
  };
  
  export const saveWatchlists = async (watchlists: any[]) => {
    const db = await openDB("cryptoApp", 1);
    const tx = db.transaction("watchlists", "readwrite");
    const store = tx.objectStore("watchlists");
  
    watchlists.forEach((watchlist) => {
      store.put(watchlist);
    });
  
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = (event) => reject(event.target);
    });
  };
  
  export const getWatchlists = async () => {
    const db = await openDB("cryptoApp", 1);
    const tx = db.transaction("watchlists", "readonly");
    const store = tx.objectStore("watchlists");
  
    return new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = (event) => resolve((event.target as IDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  };
  