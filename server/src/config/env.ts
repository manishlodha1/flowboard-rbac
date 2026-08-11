import { config } from 'dotenv';
import path from 'path';

// Local .env is optional — production hosts inject env vars directly.
config({ path: path.join(__dirname, '../../.env') });

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
