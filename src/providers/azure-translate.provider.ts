// src/providers/azure-translate.provider.ts
import axios, { AxiosError } from 'axios';
import { TranslationProvider } from './translation.provider';
import { SupportedLanguages } from '../constants/supported-languages';

export class AzureTranslateProvider implements TranslationProvider {
  private readonly apiKey: string;
  private readonly region: string;
  private readonly endpoint: string;

  constructor() {
    this.apiKey = process.env.AZURE_TRANSLATOR_KEY || '';
    this.region = process.env.AZURE_TRANSLATOR_REGION || '';
    this.endpoint = 'https://api.cognitive.microsofttranslator.com';

    if (!this.apiKey || !this.region) {
      throw new Error('Azure Translator configuration is incomplete');
    }
  }

  public async translate(text: string, targetLanguage: string): Promise<string> {
    if (!this.isSupportedLanguage(targetLanguage)) {
      throw new Error(`Language ${targetLanguage} is not supported by Azure Translator`);
    }

    try {
      const response = await axios.post(
        `${this.endpoint}/translate?api-version=3.0&to=${targetLanguage}`,
        [{ Text: text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );

      if (!response.data?.[0]?.translations?.[0]?.text) {
        throw new Error('Invalid response format from Azure Translator');
      }

      return response.data[0].translations[0].text;
    } catch (error) {
      this.handleError(error as AxiosError, text);
      return text; // Fallback to original text
    }
  }

  private isSupportedLanguage(language: string): boolean {
    // Azure supports all languages in our SupportedLanguages constant
    return SupportedLanguages.includes(language.toLowerCase() as any);
  }

  private handleError(error: AxiosError, originalText: string): void {
    if (error.response) {
      console.error(`Azure Translator API Error: ${error.response.status}`, {
        status: error.response.status,
        data: error.response.data,
        text: originalText
      });
    } else if (error.request) {
      console.error('Azure Translator Request Error:', {
        message: error.message,
        text: originalText
      });
    } else {
      console.error('Azure Translator Error:', {
        message: error.message,
        text: originalText
      });
    }
  }

  // Optional: Add language detection capability
  public async detectLanguage(text: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.endpoint}/detect?api-version=3.0`,
        [{ Text: text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data[0].language;
    } catch (error) {
      console.error('Azure Language Detection Error:', error);
      return 'en'; // Default to English if detection fails
    }
  }
}