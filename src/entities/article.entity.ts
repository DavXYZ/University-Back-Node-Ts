import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToMany, 
  JoinTable,
  ManyToOne,
  JoinColumn 
} from "typeorm";
import User from "./user.entity";

@Entity("article")
class Article {
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

  @Column({ type: "text", nullable: true })
  author_details!: string;

  @Column({ type: "varchar", nullable: true })
  article_file_path!: string;

  @Column({ type: "varchar", nullable: true })
  article_file_language!: string;

  @Column({ type: "date", nullable: true })
  date_of_article_writing!: Date;

  @Column({ type: "simple-array", nullable: true })
  article_scope!: string[];

  @Column({ type: "varchar", nullable: true })
  content_type!: string;

  // Many-to-Many relationship with Users (multiple authors)
  @ManyToMany(() => User)
  @JoinTable({
    name: "article_authors", // Name of the join table
    joinColumn: {
      name: "article_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "user_id",
      referencedColumnName: "id",
    },
  })
  authors!: User[]; // Now it's an array of Users

  // The original user (owner/creator) can still be kept if needed
  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by_user_id" })
  createdBy!: User;

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
  article_title!: string;

  @Column({ type: "varchar", nullable: true })
  educational_degree!: string;
}

export default Article;