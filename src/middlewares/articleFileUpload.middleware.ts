import multer from "multer";
import path from "path";

// Storage config for article files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/articles"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// Filter for documents only (docx, pdf, etc.)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .doc, .docx, or .pdf files are allowed!"), false);
  }
};

// Update your articleFileUpload.middleware.ts
export const articleFileUpload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Example: 10MB limit per file
}).array("article_files", 5); // "article_files" field name, max 5 files