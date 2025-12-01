
import { PartyInfo } from "../types";

export const extractBillingInfo = async (rawText: string): Promise<PartyInfo> => {
  try {
    // Call the server-side API route
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: rawText }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Server Error: ${response.statusText}`);
    }

    return result as PartyInfo;

  } catch (error: any) {
    console.error("Error extracting billing info:", error);
    throw new Error(error.message || "Failed to analyze text via server API.");
  }
};
