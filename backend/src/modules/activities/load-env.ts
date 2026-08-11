import dotenv from 'dotenv';
import path from 'path';

// Force resolve path to backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
