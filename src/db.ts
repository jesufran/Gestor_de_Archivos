import { openDB, IDBPDatabase } from 'idb';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseClient'; // Assuming firebaseClient is in the same directory

const DB_NAME = 'GestorProDB';
const ARCHIVE_STORE_NAME = 'archives';
const FILE_STORE_NAME = 'files';
const DB_VERSION = 2; // Increment version for schema change

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
            db.createObjectStore(ARCHIVE_STORE_NAME);
        }
        if (oldVersion < 2) {
            db.createObjectStore(FILE_STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

// Archive Functions
export const saveArchive = async (year: number, data: Blob) => {
  const db = await initDB();
  return db.put(ARCHIVE_STORE_NAME, data, `archive_${year}`);
};

export const getArchive = async (year: number): Promise<Blob | undefined> => {
  const db = await initDB();
  return db.get(ARCHIVE_STORE_NAME, `archive_${year}`);
};

export const listArchives = async (): Promise<number[]> => {
  const db = await initDB();
  const keys = await db.getAllKeys(ARCHIVE_STORE_NAME);
  return keys
    .map(key => parseInt((key as string).split('_')[1], 10))
    .filter(year => !isNaN(year))
    .sort((a, b) => b - a); // Sort descending
};

// File Functions
export const saveFile = async (userId: string, id: string, file: File): Promise<string> => {
    const db = await initDB();
    await db.put(FILE_STORE_NAME, file, id); // Save to IndexedDB

    // Upload to Firebase Storage
    try {
        const storageRef = ref(storage, `users/${userId}/files/${id}`);
        await uploadBytes(storageRef, file);
        console.log(`File ${id} uploaded to Firebase Storage.`);
    } catch (error) {
        console.error(`Error uploading file ${id} to Firebase Storage:`, error);
        // Optionally, handle offline scenario or retry mechanism here
    }

    return id;
};

export const getFile = async (userId: string, id: string): Promise<File | undefined> => {
    const db = await initDB();
    let file = await db.get(FILE_STORE_NAME, id); // Try IndexedDB first

    if (!file) {
        // If not found in IndexedDB, try Firebase Storage
        try {
            const storageRef = ref(storage, `users/${userId}/files/${id}`);
            const url = await getDownloadURL(storageRef);
            const response = await fetch(url);
            const blob = await response.blob();
            file = new File([blob], id); // Recreate File object

            // Save to IndexedDB for future offline access
            await db.put(FILE_STORE_NAME, file, id);
            console.log(`File ${id} downloaded from Firebase Storage and saved to IndexedDB.`);
        } catch (error) {
            console.error(`Error downloading file ${id} from Firebase Storage:`, error);
        }
    }
    return file;
};

export const deleteFile = async (userId: string, id: string): Promise<void> => {
    const db = await initDB();
    await db.delete(FILE_STORE_NAME, id); // Delete from IndexedDB

    // Delete from Firebase Storage
    try {
        const storageRef = ref(storage, `users/${userId}/files/${id}`);
        await deleteObject(storageRef);
        console.log(`File ${id} deleted from Firebase Storage.`);
    } catch (error) {
        console.error(`Error deleting file ${id} from Firebase Storage:`, error);
        // Handle cases where file might not exist in Storage (e.g., offline upload failed)
    }
};
