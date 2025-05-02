import { Request, Response, NextFunction } from "express";
import { TranslationService } from "../service/translation.service";
import { CacheService } from "../service/cache.service";
import { SupportedLanguages } from "../constants/supported-languages";

export class TranslationController {
  private translationService: TranslationService;
  private cacheService: CacheService;

  constructor() {
    this.translationService = new TranslationService();
    this.cacheService = new CacheService();
  }

  public translateText = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
      const { text, targetLanguage } = req.body;
      console.log(text,targetLanguage);
      
      if (!text || !targetLanguage) {
        return res.status(400).json({
          error: "Missing required fields: text and targetLanguage",
        });
      }

      if (!SupportedLanguages.includes(targetLanguage)) {
        return res.status(400).json({
          error: "Unsupported target language",
          supportedLanguages: SupportedLanguages,
        });
      }

      // Check cache first
      const cacheKey = `${text}-${targetLanguage}`;
      const cachedTranslation = await this.cacheService.get(cacheKey);
      if (cachedTranslation) {
        return res.json({ translation: cachedTranslation });
      }

      // Perform translation
      const translation = await this.translationService.translate(text, targetLanguage);

      // Cache the translation
      await this.cacheService.set(cacheKey, translation);

      res.json({ translation });
    } catch (error) {
      console.error("Translation error:", error);
      // Return original text if translation fails
      res.status(500).json({
        error: "Translation failed",
        originalText: req.body.text,
        fallback: true,
      });
    }
  };
}