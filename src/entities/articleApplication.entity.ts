import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToMany, 
  JoinTable,
  OneToMany
} from "typeorm";
import User from "./user.entity";
import ArticleFile from "./articleFile.entity"; // We'll create this new entity

@Entity("article_application")
class ArticleApplication {
  @PrimaryGeneratedColumn("identity")
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "varchar", length: 1000 })
  short_description!: string;

  @Column()
  category!: string;

  @Column({ type: "simple-array" })
  keywords!: string[];

  @Column({ type: "jsonb", nullable: true })
  author_details!: any; // Changed to jsonb to store structured author data

  @Column({ type: "varchar", nullable: true })
  article_file_language!: string;

  @Column({ type: "date", nullable: true })
  date_of_article_writing!: Date;

  @Column({ type: "simple-array", nullable: true })
  article_scope!: string[];

  @Column({ type: "varchar", nullable: true })
  content_type!: string;

  // ✅ Multiple users (authors/co-applicants)
  @ManyToMany(() => User)
  @JoinTable({
    name: "article_application_users",
    joinColumn: {
      name: "application_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
  })
  users!: User[];

  // ✅ One-to-many relationship with ArticleFiles
  @OneToMany(() => ArticleFile, file => file.articleApplication, {
    cascade: true,
    eager: true // Load files automatically when loading application
  })
  files!: ArticleFile[];

  @Column({ type: "int", nullable: true })
  approved_by!: number;

  @Column({ type: "timestamp", nullable: true })
  approved_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: "varchar", nullable: true })
  magazine!: string;

  @Column({ type: "varchar", nullable: true })
  magazine_series!: string;

  @Column({ type: "varchar", nullable: true })
  article_type!: string;

  @Column({ type: "varchar", nullable: true })
  educational_degree!: string;

  @Column({ type: "boolean", default: false })
  terms_accepted!: boolean;

  @Column({ type: "text", nullable: true })
  publication_details!: string;
}

export default ArticleApplication;