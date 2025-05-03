// routes/articleApplication.routes.ts
import { Router } from "express";
import { ArticleApplicationController } from "../controller/articleApplication.controller";

const router = Router();

router.post("/", ArticleApplicationController.createApplication);
router.get("/", ArticleApplicationController.getAllApplications);
router.get("/:id", ArticleApplicationController.getApplicationById);
router.patch("/:id/status", ArticleApplicationController.updateStatus);

export default router;
