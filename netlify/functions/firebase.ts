import * as admin from 'firebase-admin';

// Comprueba si la variable de entorno está presente.
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY no está definida.');
}

// Parsea la clave de la cuenta de servicio desde la variable de entorno.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Inicializa la app de Firebase Admin solo si no ha sido inicializada antes.
// Esto previene errores de "app ya existe" en entornos serverless.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Exporta la instancia de Firestore para ser usada por otras funciones.
export const db = admin.firestore();
