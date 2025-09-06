import type { Handler, HandlerContext } from "@netlify/functions";
import { db } from './firebase-admin';

const handler: Handler = async (event, context: HandlerContext) => {
  // Asegurarse de que el usuario está autenticado
  const user = context.clientContext?.user;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No autorizado. Debes iniciar sesión.' }),
    };
  }

  try {
    const userDocRef = db.collection('userData').doc(user.sub);
    const doc = await userDocRef.get();

    if (doc.exists) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc.data()),
      };
    } else {
      // Si el usuario es nuevo y no tiene datos, retorna un objeto vacío.
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      };
    }
  } catch (error: any) {
    console.error('Error al obtener datos de Firestore:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error interno del servidor: ${error.message}` }),
    };
  }
};

export { handler };
