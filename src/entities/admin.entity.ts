import { IsEmail, IsNotEmpty, Length } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("admin")
class Admin {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email must be a valid email address" })
    email!: string;

    @Column({ type: "varchar", length: 255 })
    @IsNotEmpty({ message: "Password is required" })
    @Length(8, 50, { message: "Password must be between 8 and 50 characters" })
    password!: string;

    @Column({ type: "varchar", nullable: true })
    reset_password_token?: string;

    @Column({ type: "timestamp", nullable: true })
    reset_password_expires?: Date;

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at!: Date;
}