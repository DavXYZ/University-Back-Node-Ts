// src/providers/mock-translate.provider.ts
import { TranslationProvider } from './translation.provider';
import { SupportedLanguages } from '../constants/supported-languages';

export class MockTranslateProvider implements TranslationProvider {
  private readonly mockTranslations: Record<string, string> = {
    'hello': 'hola',
    'world': 'mundo',
    'goodbye': 'adiós',
    'thank you': 'gracias',
    // Add more mock translations as needed
  };

  private readonly languagePrefixes: Record<string, string> = {
    'es': '[ES]',
    'fr': '[FR]',
    'de': '[DE]',
    'it': '[IT]',
    'pt': '[PT]',
    'ru': '[RU]',
    'zh': '[ZH]',
    'ja': '[JA]',
    'ar': '[AR]'
  };

  public async translate(text: string, targetLanguage: string): Promise<string> {
    if (!this.isSupportedLanguage(targetLanguage)) {
      console.warn(`MockTranslateProvider: Unsupported language '${targetLanguage}'`);
      return text;
    }

    // Return mock translation if available
    const lowerText = text.toLowerCase();
    if (this.mockTranslations[lowerText]) {
      return this.mockTranslations[lowerText];
    }

    // Fallback to language-prefixed text
    const prefix = this.languagePrefixes[targetLanguage] || `[${targetLanguage.toUpperCase()}]`;
    return `${prefix} ${text}`;
  }

  private isSupportedLanguage(language: string): boolean {
    return SupportedLanguages.includes(language.toLowerCase() as any);
  }

  // For testing purposes
  public addMockTranslation(source: string, translation: string): void {
    this.mockTranslations[source.toLowerCase()] = translation;
  }

  // For testing purposes
  public clearMockTranslations(): void {
    Object.keys(this.mockTranslations).forEach(key => {
      delete this.mockTranslations[key];
    });
  }
}