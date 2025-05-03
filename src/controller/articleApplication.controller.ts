// controllers/articleApplication.controller.ts
import { Request, Response } from "express";
import { ArticleApplicationService } from "../service/articleApplication.service";

const service = new ArticleApplicationService();

export class ArticleApplicationController {
  static async createApplication(req: Request, res: Response) {
    try {
      const userId = req.body.userId; // mock for now
      const data = req.body;
      const result = await service.createApplication(data, userId);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllApplications(_: Request, res: Response) {
    try {
      const apps = await service.getAllApplications();
      res.json(apps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getApplicationById(req: Request, res: Response):Promise<any> {
    try {
      const app = await service.getApplicationById(+req.params.id);
      if (!app) return res.status(404).json({ error: "Not found" });
      res.json(app);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const updated = await service.updateStatus(+req.params.id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
