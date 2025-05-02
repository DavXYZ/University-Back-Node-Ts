import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration328251743166721102 implements MigrationInterface {
    name = 'Migration328251743166721102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'author', 'section_leader', 'reviewer')`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "phone_number" character varying(12), "role" "public"."users_role_enum" NOT NULL, "password" character varying(255) NOT NULL, "is_activated" boolean NOT NULL DEFAULT false, "activation_link" character varying NOT NULL, "reset_password_token" character varying, "reset_password_expires" TIMESTAMP, "verification_code" character varying, "verification_code_expires" TIMESTAMP, "profile_image" character varying NOT NULL, "social_link" character varying, "date_of_birth" date NOT NULL, "gender" "public"."users_gender_enum" NOT NULL, "country" character varying NOT NULL, "city" character varying NOT NULL, "info_about_article" text, "published_articles" text, "thematic_focus_of_articles" text, "past_conferences_or_meetings" text, "membership_in_scientific_team" text, "university" character varying NOT NULL, "academic_degree" character varying NOT NULL, "academic_title" character varying NOT NULL, "profession" character varying NOT NULL, "position" character varying NOT NULL, "level_of_education" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
