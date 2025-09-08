import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import admin from "firebase-admin";
import './firebase'; // Asegura que la app de Firebase Admin se inicialice

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // 1. Solo permitir peticiones POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  // 2. Verificar que el usuario sea el administrador usando Firebase Auth
  const { authorization } = event.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Acceso no autorizado: token ausente." }),
    };
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Check for custom admin claim. This assumes 'isAdmin' is a custom claim set to true for administrators.
    // This claim would need to be managed separately, e.g., via Firebase Admin SDK or a dedicated admin panel.
    if (!decodedToken.isAdmin) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Acceso denegado: se requiere ser administrador." }),
      };
    }
  } catch (error) {
    console.error("Error verificando el token:", error);
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Token inválido o expirado." }),
    };
  }

  // 3. Analizar el cuerpo de la petición
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "Cuerpo de la petición ausente." }) };
  }
  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Se requiere email y contraseña." }),
    };
  }

  // 4. Crear el usuario en Firebase Authentication
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Usuario creado exitosamente", uid: userRecord.uid }),
    };
  } catch (error: any) {
    // Manejar errores comunes de Firebase
    const errorMessage = error.code === 'auth/email-already-exists'
      ? 'Este correo electrónico ya está en uso.'
      : 'Ocurrió un error al crear el usuario.';
    return {
      statusCode: 409, // 409 Conflict es apropiado para "ya existe"
      body: JSON.stringify({ error: errorMessage, detail: error.message }),
    };
  }
};

export { handler };
