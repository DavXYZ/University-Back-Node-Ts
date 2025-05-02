// src/service/translation.service.ts
import { TranslationProvider } from "../providers/translation.provider";
import { GoogleTranslateProvider } from "../providers/google-translate.provider";
import { DeepLTranslateProvider } from "../providers/deepl-translate.provider";
import { AzureTranslateProvider } from "../providers/azure-translate.provider";
import { MockTranslateProvider } from "../providers/mock-translate.provider";
import { RapidTranslateProvider } from "../providers/rapid-translate.provider";

export class TranslationService {
  private provider: TranslationProvider;

  constructor() {
    this.provider = this.getTranslationProvider();
  }

  private getTranslationProvider(): TranslationProvider {
    const translationService = process.env.TRANSLATION_SERVICE || "google";

    switch (translationService.toLowerCase()) {
      case "google":
        return new GoogleTranslateProvider();
      case "deepl":
        return new DeepLTranslateProvider();
      case "azure":
        return new AzureTranslateProvider();
      case "rapid":
        return new RapidTranslateProvider();
      default:
        return new MockTranslateProvider();
    }
  }

  public async translate(text: string, targetLanguage: string): Promise<string> {
    return this.provider.translate(text, targetLanguage);
  }
}
