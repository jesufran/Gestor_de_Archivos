import { openDB, IDBPDatabase } from 'idb';

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
export const saveFile = async (id: string, file: File): Promise<string> => {
    const db = await initDB();
    await db.put(FILE_STORE_NAME, file, id);
    return id;
};

export const getFile = async (id: string): Promise<File | undefined> => {
    const db = await initDB();
    return db.get(FILE_STORE_NAME, id);
};

export const deleteFile = async (id: string): Promise<void> => {
    const db = await initDB();
    await db.delete(FILE_STORE_NAME, id);
};
