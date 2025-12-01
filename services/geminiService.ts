import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PartyInfo } from "../types";

// Helper to validate API Key availability
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
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
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
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
      throw new Error("No response from AI");
    }

    const data = JSON.parse(jsonText) as PartyInfo;
    return data;

  } catch (error) {
    console.error("Error extracting billing info:", error);
    throw error;
  }
};