// routes/article.routes.ts
import { Router } from "express";
import ArticleController from "../controller/article.controller";
const router = Router();

router.post("/", ArticleController.submitArticle);
router.get("/", ArticleController.getArticles);

export default router;
