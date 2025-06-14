import { Request, Response } from "express";
import { ArticleApplicationService } from "../service/articleApplication.service";
import fs from 'fs';
import path from 'path';

const service = new ArticleApplicationService();

export class ArticleApplicationController {
  static async createApplication(req: Request, res: Response): Promise<any> {
    console.log('Raw request body:', req.body);
    console.log('Uploaded files:', req.files);

    let formData;
    let uploadedFiles: Express.Multer.File[] = [];

    try {
      // Handle form data parsing
      if(!req.user){
        throw new Error("User is not defined");
      }
      
      // Parse formData from request body
      if (typeof req.body.formData === 'string') {
        try {
          formData = JSON.parse(req.body.formData);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid form data JSON' });
        }
      } else if (typeof req.body === 'object') {
        formData = req.body;
      } else {
        return res.status(400).json({ error: "Invalid form data format" });
      }

      uploadedFiles = req.files as Express.Multer.File[] || [];

      // Validate required fields
      if (!formData.basicInfo || !formData.authorInfo) {
        throw new Error("Basic info or author info is missing");
      }

      const { basicInfo, authorInfo } = formData;
      const fileUpload = formData.fileUpload || { files: [] };

      // Validate required basic info
      if (!basicInfo.title || !basicInfo.field || !basicInfo.articleType) {
        throw new Error("Title, field, and article type are required");
      }

      // Validate authors
      if (!authorInfo.authors || !authorInfo.authors.length) {
        throw new Error("At least one author is required");
      }

      // Prepare files data
      const filesWithMeta = uploadedFiles.map((file) => {
        return {
          original_name: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
        };
      });

      // Prepare application data
      const data = {
        title: basicInfo.title,
        short_description: authorInfo.biography,
        category: basicInfo.field,
        keywords: basicInfo.keywords || [],
        author_details: authorInfo.authors,
        article_scope: [basicInfo.journal, basicInfo.journalSeries].filter(Boolean),
        content_type: basicInfo.articleType,
        article_files: filesWithMeta,
        language: basicInfo.language,
        education_level: authorInfo.educationLevel,
        publication_date: basicInfo.date,
        terms_accepted: formData.reviewSubmit?.termsAccepted || false
      };

      console.log('Processed application data:', data);
      const userId = (req.user as { id: string }).id;
      const result = await service.createApplication(data, [userId]);
      return res.status(201).json(result);

    } catch (error: any) {
      console.error('Error creating application:', error);

      // Clean up uploaded files if error occurs
      if (uploadedFiles.length) {
        uploadedFiles.forEach(file => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.error('Error deleting file:', file.path, err);
          }
        });
      }

      // Handle specific error types
      if (error.code === '23505') { // PostgreSQL unique violation
        return res.status(409).json({ error: "Duplicate entry" });
      }

      if (error.name === 'EntityNotFoundError') { // TypeORM entity not found
        return res.status(404).json({ error: "Related entity not found" });
      }

      // Default error response
      const statusCode = error.statusCode || 400;
      return res.status(statusCode).json({ 
        error: error.message || "An error occurred while creating the application"
      });
    }
  }
}