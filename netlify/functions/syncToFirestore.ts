import type { Handler } from "@netlify/functions";
import { db, admin } from './firebase'; // Importar 'admin' también

const handler: Handler = async (event) => {
  // Rechazar si no es un método POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  // Verificar el token de Firebase ID
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No autorizado. Token de autenticación no proporcionado o mal formado.' }),
    };
  }

  const idToken = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error: any) {
    console.error('Error al verificar el token de Firebase ID:', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: `No autorizado. Token inválido: ${error.message}` }),
    };
  }

  const uid = decodedToken.uid; // UID del usuario de Firebase

  try {
    const dataToSync = JSON.parse(event.body || '{}');

    // Usar el UID del usuario de Firebase como ID del documento en Firestore
    const userDocRef = db.collection('userData').doc(uid);
    
    // `set` sobrescribe el documento completo, guardando el estado actual de la app.
    await userDocRef.set(dataToSync);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Datos sincronizados correctamente.' }),
    };
  } catch (error: any) {
    console.error('Error al sincronizar con Firestore:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error interno del servidor: ${error.message}` }),
    };
  }
};

export { handler };
