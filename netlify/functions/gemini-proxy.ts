import { GoogleGenAI, GenerateContentResponse, Content, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { Handler } from "@netlify/functions";

interface RequestPayload {
  contents: Content;
  config?: any;
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'La clave API de IA no está configurada en el servidor.' }) };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const body: RequestPayload = JSON.parse(event.body || '{}');
    
    if (!body.contents) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Falta el contenido en la solicitud.' }) };
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: body.contents,
        config: {
          ...body.config,
          safetySettings,
        },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response.text }),
    };

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Ocurrió un error al procesar la solicitud de IA: ${error.message}` }),
    };
  }
};

export { handler };