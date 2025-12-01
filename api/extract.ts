
import { GoogleGenAI, Schema, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { text } = await request.json();

    // Access API Key from server-side environment variables
    // Supports both GEMINI_API_KEY (recommended) and API_KEY (legacy)
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      console.error("Server Error: Missing API Key configuration");
      return new Response(JSON.stringify({ error: 'Server configuration error: API Key is missing.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!text) {
      return new Response(JSON.stringify({ error: 'Input text is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const recipientSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        companyName: {
          type: Type.STRING,
          description: "Full name of the person or Company Name found in the text.",
        },
        email: {
          type: Type.STRING,
          description: "Email address for billing/invoicing.",
        },
        addressLine1: {
          type: Type.STRING,
          description: "Street address or first part of the address.",
        },
        addressLine2: {
          type: Type.STRING,
          description: "City, State, Zip, Country combined into a single string.",
        },
        vatNumber: {
          type: Type.STRING,
          description: "VAT Number or Tax ID if present. Return empty string if not found.",
        },
      },
      required: ["companyName", "addressLine1", "addressLine2", "email"],
    };

    const prompt = `
      You are an expert data extraction assistant.
      Analyze the following unstructured text (which might be an email signature, a request for invoice, or a raw address block).
      Extract the billing information for the "Bill To" section of an invoice.
      
      Input Text:
      "${text}"
      
      Ensure address extraction is logical. If parts of the address are missing, do your best to format what is available.
      If a field is completely missing, use an empty string.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipientSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    return new Response(response.text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
