// src/providers/rapid-translate.provider.ts
import { TranslationProvider } from "./translation.provider";

interface TranslationResponse {
  data: {
    translatedText: string;
  };
  status?: string;
  message?: string;
}

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body: FormData;
}

function getFormDataHeaders(formData: FormData): Record<string, string> {
  // @ts-ignore - Node FormData might need manual handling if not using a package like `form-data`
  return typeof formData.getHeaders === "function" ? formData.getHeaders() : {};
}

export class RapidTranslateProvider implements TranslationProvider {
  async translate(text: string, targetLanguage: string): Promise<string> {
    const data = new FormData();
    data.append("source_language", "en");
    data.append("target_language", targetLanguage);
    data.append("text", text);

    const url = "https://text-translator2.p.rapidapi.com/translate";

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "c1ba096602mshee78b87fb2a71f2p1d1c02jsn71e4aa8007c0",
        "x-rapidapi-host": "text-translator2.p.rapidapi.com",
        ...getFormDataHeaders(data),
      },
      body: data,
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = (await response.json()) as TranslationResponse;

      if (!result.data?.translatedText) {
        throw new Error("Invalid response format from translation API");
      }

      return result.data.translatedText;
    } catch (error) {
      console.error("RapidAPI Translation Error:", error);
      throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
