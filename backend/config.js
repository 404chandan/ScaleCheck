import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/scalecheck?authSource=admin',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
  dataDir: path.join(__dirname, 'data')
};
