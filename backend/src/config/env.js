import 'dotenv/config';

if (!process.env.JWT_SECRET) throw new Error('Missing required environment variable: JWT_SECRET');
if (!process.env.ENCRYPTION_KEY) throw new Error('Missing required environment variable: ENCRYPTION_KEY');

export const envPort = process.env.BACKEND_PORT || 4000;
export const envJWT = process.env.JWT_SECRET;
export const envUrl = process.env.DATABASE_URL;