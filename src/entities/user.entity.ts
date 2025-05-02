// src/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  IsUrl,
  IsDateString,
} from "class-validator";
import { UserRole } from "../enums/userRole.enum"; // Move UserRole enum to a separate file for better organization
import { Gender } from "../enums/gender.enum";

@Entity("users")
class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50 })
  @IsNotEmpty({ message: "Full name is required" })
  @Length(2, 50, { message: "Full name must be between 2 and 50 characters" })
  full_name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Email must be a valid email address" })
  email!: string;

  @Column({ type: "varchar", length: 12, nullable: true })
  @IsOptional()
  @Matches(/^\+374[0-9]{8}$/, {
    message: "Phone number must start with +374 and have 8 digits after it",
  })
  phone_number?: string;

  @Column({type: "boolean" ,default:false})
  @IsOptional()
  remember_me!: boolean;

  @Column({ type: "enum", enum: UserRole })
  @IsEnum(UserRole, { message: 'Role must be either "admin" or "user"' })
  role!: UserRole;

  @Column({ type: "varchar", length: 255 })
  @IsNotEmpty({ message: "Password is required" })
  @Length(8, 50, { message: "Password must be between 8 and 50 characters" })
  password!: string;

  @Column({ type: "boolean", default: false })
  is_activated!: boolean;

  @Column({ type: "varchar" })
  activation_link!: string;

  @Column({ type: "varchar", nullable: true })
  reset_password_token?: string;

  @Column({ type: "timestamp", nullable: true })
  reset_password_expires?: Date;

  @Column({ type: "varchar", nullable: true })
  verification_code?: string;

  @Column({ type: "timestamp", nullable: true })
  verification_code_expires?: Date;

  @Column({ type: "varchar" })
  @IsUrl({}, { message: "Profile image must be a valid URL" })
  profile_image?: string;

  @Column({ type: "varchar", nullable: true })
  @IsOptional()
  @IsUrl({}, { message: "social link must be a valid URL" })
  social_link?: string;



  @Column({ type: "date" })
  @IsDateString({}, { message: "Date of birth must be a valid date" })
  date_of_birth?: string;

  @Column({ type: "enum", enum: Gender })
  gender?: Gender;

  @Column({ type: "varchar" })
  country?: string;

  @Column({ type: "varchar" })
  city?: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  published_articles?: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  thematic_focus_of_articles?: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  past_conferences_or_meetings?: string;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  membership_in_scientific_team?: string;

  @Column({ type: "varchar" })
  university?: string;

  @Column({ type: "varchar" })
  academic_degree?: string;

  @Column({ type: "varchar" })
  academic_title?: string;

  @Column({ type: "varchar" })
  profession?: string;

  @Column({ type: "varchar" })
  position?: string;

  @Column({ type: "varchar" })
  level_of_education?: string;

  // Add this column to your User entity class
  @Column({ type: "boolean", default: false })
  @IsNotEmpty({ message: "Data processing consent is required" })
  data_processing_consent!: boolean;

  // Also add it to your constructor if you have one

  @CreateDateColumn({ type: "timestamp" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at!: Date;
}

export default User;
