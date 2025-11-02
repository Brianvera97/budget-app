import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

if (!ENV.MONGO_URI) {
  console.warn('⚠️  MONGO_URI no está definida. Verificá tu archivo .env');
}