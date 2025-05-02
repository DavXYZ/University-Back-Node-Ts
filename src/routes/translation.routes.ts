import express from "express";
import { TranslationController } from "../controller/translation.controller";
import { rateLimit } from "express-rate-limit";

const router = express.Router();
const controller = new TranslationController();

const translationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", translationLimiter, controller.translateText);

export default router;