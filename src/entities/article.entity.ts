import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
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
  
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
  
  @Column({ type: "int", nullable: true })
  approved_by!: number;
  
  @Column({ type: "timestamp", nullable: true })
  approved_at!: Date;
  
  @CreateDateColumn()
  created_at!: Date;
}

export default Article;