import { Router } from "express";
import { ArticleApplicationController } from "../controller/articleApplication.controller";
import { articleFileUpload } from "../middlewares/articleFileUpload.middleware";
import { authenticateAccess } from "../middlewares/authenticate";

const router = Router();

// Update your router.ts
router.post(
  "/article-applications",
  articleFileUpload, // Now handles multiple files
  authenticateAccess,
  ArticleApplicationController.createApplication
);

router.post("/upload", articleFileUpload, (req, res):void =>{
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    res.status(400).json({ message: "No files uploaded" })
    return ;
  }

  const uploadedFiles = (req.files as Express.Multer.File[]).map((file) => ({
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
    lastModified: Date.now(), // Optional: can be improved with metadata
    id: `${file.filename}`,  // filename used as unique ID
  }))

  res.json({ uploaded: uploadedFiles })
  return;
})

export default router;

