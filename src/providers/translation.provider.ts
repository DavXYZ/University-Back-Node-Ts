export abstract class TranslationProvider {
    public abstract translate(text: string, targetLanguage: string): Promise<string>;
  }