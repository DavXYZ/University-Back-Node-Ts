import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration4162521744808907877 implements MigrationInterface {
    name = 'Migration4162521744808907877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "remember_me" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "remember_me"`);
    }

}
