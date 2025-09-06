import type { Handler, HandlerContext } from "@netlify/functions";
import { db } from './firebase-admin';

const handler: Handler = async (event, context: HandlerContext) => {
  // Rechazar si no es un método POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  // Asegurarse de que el usuario está autenticado
  const user = context.clientContext?.user;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No autorizado. Debes iniciar sesión.' }),
    };
  }
  
  try {
    const dataToSync = JSON.parse(event.body || '{}');

    // Usar el ID de usuario de Netlify como ID del documento en Firestore
    const userDocRef = db.collection('userData').doc(user.sub);
    
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
