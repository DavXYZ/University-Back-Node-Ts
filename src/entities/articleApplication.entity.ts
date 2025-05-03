// src/entities/ArticleApplication.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import User from "./user.entity";
  
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
  
    @Column({ type: "varchar", default: "pending" })
    status!: "pending" | "approved" | "rejected";
  
    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;
  
    @CreateDateColumn()
    submitted_at!: Date;
  }
  
  export default ArticleApplication;