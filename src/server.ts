import { startServer } from './server/index';
import express from 'express';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// For local development
if (process.env.NODE_ENV !== 'production') {
  startServer(PORT);
  console.log(`Server started on port ${PORT}`);
}

// For Vercel serverless
const app = express();
export default app; 