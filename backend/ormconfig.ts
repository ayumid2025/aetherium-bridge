import { DataSource } from 'typeorm';
import { User } from './src/entities/User';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true, // Auto-create tables (use only in development)
  logging: false,
  entities: [User], // We'll create this entity next
  migrations: [],
  subscribers: [],
});
