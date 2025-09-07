import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from './firebaseConfig'; // Importar la configuración

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios de Firebase para ser usados en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
