import dotenv from 'dotenv';
import fs from 'fs'; // Using synchronous file reading
import path from 'path';
import { DataSource } from 'typeorm';

dotenv.config();

const ormPath = path.join(__dirname, 'ormconfig.json');

// Load ORM config synchronously
let ormConfigJSON;
try {
  const ormConfigData = fs.readFileSync(ormPath, 'utf8');
  ormConfigJSON = JSON.parse(ormConfigData);
} catch (err) {
  console.error('Failed to load ormconfig.json', err);
}

export const AppDataSource = new DataSource({
  type: ormConfigJSON.type,
  host: ormConfigJSON.host,
  port: ormConfigJSON.port,
  username: ormConfigJSON.username,
  password: ormConfigJSON.password ,
  database: ormConfigJSON.database,
  synchronize: ormConfigJSON.synchronize,
  logging: ormConfigJSON.logging,
  entities: ormConfigJSON.entities,
  migrations: ormConfigJSON.migrations,
});

console.log('ORM Config Loaded:');
