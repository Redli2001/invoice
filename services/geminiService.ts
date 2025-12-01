import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PartyInfo } from "../types";

// Helper to validate API Key availability
const getApiKey = (): string => {
  // Safe access to process.env to prevent "process is not defined" errors in some browser environments
  // if the bundler hasn't replaced the variable.
  let key: string | undefined;
  
  try {
    // We strictly follow the prompt rule to use process.env.API_KEY
    // The build tool (Vite/Webpack/Vercel) must replace this or polyfill process.
    key = process.env.API_KEY;
  } catch (e) {
    // If process is not defined, key remains undefined
  }
  
  if (!key || key.trim() === '') {
    console.error("API_KEY is not set in the environment.");
    // We throw a specific error that the UI can catch and show setup instructions for
    throw new Error("API_KEY_MISSING");
  }
  return key;
};

// Define the expected schema for the output
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

export const extractBillingInfo = async (rawText: string): Promise<PartyInfo> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an expert data extraction assistant.
      Analyze the following unstructured text (which might be an email signature, a request for invoice, or a raw address block).
      Extract the billing information for the "Bill To" section of an invoice.
      
      Input Text:
      "${rawText}"
      
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

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("AI returned an empty response.");
    }

    const data = JSON.parse(jsonText) as PartyInfo;
    return data;

  } catch (error: any) {
    console.error("Error extracting billing info:", error);
    
    // Pass through the specific missing key error
    if (error.message === "API_KEY_MISSING") {
      throw error;
    }

    // Handle generic API errors
    throw new Error(error.message || "Failed to analyze text.");
  }
};