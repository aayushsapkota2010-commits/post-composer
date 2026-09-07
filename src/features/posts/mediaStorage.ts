import type { MediaFile } from "./postSlice";

const DB_NAME = "PostComposerDB";
const STORE_NAME = "media";
const DB_VERSION = 1;

type StoredMedia = {
  postId: string;
  mediaFiles: MediaFile[];
};

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "postId",
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const saveMedia = async (
  postId: string,
  mediaFiles: MediaFile[]
): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    const data: StoredMedia = {
      postId,
      mediaFiles,
    };

    store.put(data);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

export const getMedia = async (
  postId: string
): Promise<MediaFile[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(postId);

    request.onsuccess = () => {
      db.close();

      const result = request.result as
        | StoredMedia
        | undefined;

      resolve(result?.mediaFiles || []);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

export const deleteMedia = async (
  postId: string
): Promise<void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    store.delete(postId);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};