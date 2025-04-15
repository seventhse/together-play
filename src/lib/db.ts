// IndexedDB utility for storing and retrieving generated images

export interface StoredImage {
  id?: number;
  imageData: string;
  prompt: string;
  model: string;
  timestamp: number;
  params: Record<string, unknown>;
}

const DB_NAME = 'together-flux-db';
const DB_VERSION = 1;
const STORE_NAME = 'generated-images';

// Initialize the database
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject('Error opening IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store for generated images
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });

        // Create indexes for faster queries
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('model', 'model', { unique: false });
      }
    };
  });
}

// Save a generated image to IndexedDB
export async function saveImage(image: StoredImage): Promise<number> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.add(image);

    request.onsuccess = (event) => {
      const id = (event.target as IDBRequest<number>).result;
      resolve(id);
    };

    request.onerror = (event) => {
      console.error('Error saving image to IndexedDB:', event);
      reject('Error saving image');
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Get all stored images, sorted by timestamp (newest first)
export async function getAllImages(): Promise<StoredImage[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    const request = index.openCursor(null, 'prev'); // 'prev' for descending order
    const images: StoredImage[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        images.push(cursor.value);
        cursor.continue();
      } else {
        resolve(images);
      }
    };

    request.onerror = (event) => {
      console.error('Error retrieving images from IndexedDB:', event);
      reject('Error retrieving images');
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Delete an image by ID
export async function deleteImage(id: number): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error deleting image from IndexedDB:', event);
      reject('Error deleting image');
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

// Clear all stored images
export async function clearAllImages(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error('Error clearing images from IndexedDB:', event);
      reject('Error clearing images');
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}
