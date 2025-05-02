// src/providers/deepl-translate.provider.ts
import axios, { AxiosError } from 'axios';
import { TranslationProvider } from './translation.provider';
import { SupportedLanguages } from '../constants/supported-languages';

export class DeepLTranslateProvider implements TranslationProvider {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPL_API_KEY || '';
    const isFreeAccount = process.env.DEEPL_FREE_TIER === 'true';
    this.apiUrl = isFreeAccount 
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate';

    if (!this.apiKey) {
      throw new Error('DeepL API key is not configured');
    }
  }

  public async translate(text: string, targetLanguage: string): Promise<string> {
    if (!this.isSupportedLanguage(targetLanguage)) {
      throw new Error(`Language ${targetLanguage} is not supported by DeepL`);
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          text: [text],
          target_lang: targetLanguage.toUpperCase()
        },
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      if (!response.data?.translations?.[0]?.text) {
        throw new Error('Invalid response format from DeepL API');
      }

      return response.data.translations[0].text;
    } catch (error) {
      this.handleError(error as AxiosError, text);
      return text; // Fallback to original text
    }
  }

  private isSupportedLanguage(language: string): boolean {
    // DeepL uses slightly different language codes than standard
    const deeplSupported = [
      'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 
      'fi', 'fr', 'hu', 'id', 'it', 'ja', 'ko', 'lt',
      'lv', 'nb', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk',
      'sl', 'sv', 'tr', 'uk', 'zh'
    ];
    return deeplSupported.includes(language.toLowerCase());
  }

  private handleError(error: AxiosError, originalText: string): void {
    if (error.response) {
      console.error(`DeepL API Error: ${error.response.status}`, {
        status: error.response.status,
        data: error.response.data,
        text: originalText
      });
    } else if (error.request) {
      console.error('DeepL API Request Error:', {
        message: error.message,
        text: originalText
      });
    } else {
      console.error('DeepL Translation Error:', {
        message: error.message,
        text: originalText
      });
    }
  }
}