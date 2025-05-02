import { TranslationProvider } from "./translation.provider";
import axios from "axios";

export class GoogleTranslateProvider implements TranslationProvider {
  private readonly apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  private readonly endpoint = "https://translation.googleapis.com/language/translate/v2";

  public async translate(text: string, targetLanguage: string): Promise<string> {
    const response = await axios.post(
      this.endpoint,
      {
        q: text,
        target: targetLanguage,
        format: "text",
      },
      {
        params: { key: this.apiKey },
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data.data.translations[0].translatedText;
  }
}