import { AppDataSource } from "../data-source";
import Article from "../entities/article.entity";
import User from "../entities/user.entity";

export class ArticleService {
  private articleRepo = AppDataSource.getRepository(Article);

  async submitArticle(data: any, userId: string) {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) throw new Error("User not found");

    const article = this.articleRepo.create({
      ...data,
      user,
    });

    return await this.articleRepo.save(article);
  }

  async getArticles() {
    return await this.articleRepo.find({
      relations: ["user"],
    });
  }
}
