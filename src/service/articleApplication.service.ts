import { AppDataSource } from "../data-source";
import ArticleApplication from "../entities/articleApplication.entity";
import User from "../entities/user.entity";
import ArticleFile from "../entities/articleFile.entity";
import { QueryRunner } from "typeorm";

export class ArticleApplicationService {
  private applicationRepo = AppDataSource.getRepository(ArticleApplication);
  private userRepo = AppDataSource.getRepository(User);
  private fileRepo = AppDataSource.getRepository(ArticleFile);

  async createApplication(data: any, userIds: string[]) {
    const queryRunner: QueryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!data || !userIds?.length) {
        throw new Error("Invalid input data");
      }

      // ✅ Load users safely with queryRunner
      const users = await queryRunner.manager.findByIds(User, userIds);
      if (users.length !== userIds.length) {
        throw new Error("One or more users not found");
      }

      // ✅ Create the application
      const application = queryRunner.manager.create(ArticleApplication, {
        title: data.title,
        short_description: data.short_description,
        category: data.category,
        keywords: data.keywords,
        author_details: data.author_details,
        article_scope: data.article_scope,
        content_type: data.content_type,
        article_file_language: data.language,
        educational_degree: data.education_level,
        date_of_article_writing: data.publication_date,
        terms_accepted: data.terms_accepted,
        users: users,
        magazine: data.magazine || null,
        magazine_series: data.magazine_series || null,
        article_type: data.article_type || null,
        publication_details: data.publication_details || null,
      });

      const savedApplication = await queryRunner.manager.save(application);

      // ✅ Create and save article files if provided
      if (Array.isArray(data.article_files) && data.article_files.length > 0) {
        const files = data.article_files.map((file: any) =>
          queryRunner.manager.create(ArticleFile, {
            original_name: file.original_name || file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
            file_type: file.file_type || "main",
            articleApplication: savedApplication,
          })
        );
        await queryRunner.manager.save(files);
      }

      await queryRunner.commitTransaction();

      // ✅ Reload with relations
      return await this.applicationRepo.findOne({
        where: { id: savedApplication.id },
        relations: ["users", "files"],
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();

      const err = error instanceof Error ? error : new Error(String(error));

      if (err.message.includes("duplicate key")) {
        err.message = "An application with similar data already exists.";
      } else if (err.message.includes("violates foreign key constraint")) {
        err.message = "Invalid foreign key in application data.";
      }

      (err as any).context = {
        service: "ArticleApplicationService",
        method: "createApplication",
        inputData: {
          title: data?.title,
          userIds,
        },
      };

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
