import { AppDataSource } from "../data-source";
import ArticleApplication  from "../entities/articleApplication.entity";
import User from "../entities/user.entity";

export class ArticleApplicationService {
  private applicationRepo = AppDataSource.getRepository(ArticleApplication);
  
  async createApplication(data: any, userId: string) {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) throw new Error("User not found");

    const application = this.applicationRepo.create({
      ...data,
      user,
    });

    return await this.applicationRepo.save(application);
  }

  async getAllApplications() {
    return await this.applicationRepo.find({
      relations: ["user"],
    });
  }

  async getApplicationById(id: number) {
    return await this.applicationRepo.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async updateStatus(id: number, status: "approved" | "rejected") {
    const application = await this.applicationRepo.findOneBy({ id });
    if (!application) throw new Error("Application not found");

    application.status = status;
    return await this.applicationRepo.save(application);
  }
}
