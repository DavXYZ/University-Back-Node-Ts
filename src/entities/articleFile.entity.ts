import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne 
} from "typeorm";
import ArticleApplication from "./articleApplication.entity";

@Entity("article_file")
class ArticleFile {
  @PrimaryGeneratedColumn("identity")
  id!: number;

  @Column()
  original_name!: string;

  @Column()
  path!: string;

  @Column()
  mimetype!: string;

  @Column({ type: "varchar", nullable: true })
  file_type!: string; // e.g., "main", "supplementary", etc.

  @Column({ type: "int" })
  size!: number;

  @ManyToOne(() => ArticleApplication, application => application.files)
  articleApplication!: ArticleApplication;
}

export default ArticleFile;