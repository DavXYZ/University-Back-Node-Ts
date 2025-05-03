// controllers/article.controller.ts
import { Request, Response } from "express";
import { ArticleService } from "../service/article.service";

const service = new ArticleService();
export default class ArticleController{
    static async submitArticle(req: Request, res: Response){
        try {
          const userId = req.body.userId; // Սա հետո կարելի է վերցնել auth middleware-ից
          const data = req.body;
          const result = await service.submitArticle(data, userId);
          res.status(201).json(result);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
    }
    static async  getArticles (_: Request, res: Response){
        try {
          const articles = await service.getArticles();
          res.json(articles);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }
}


