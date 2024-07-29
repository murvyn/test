import mongoose from 'mongoose'
import { logger } from './logger'
import 'dotenv/config'


const db = process.env.MONGODB_URI

if(!db) {
    throw new Error('MONGODB_URI environment variable is not set')
}

export const connectDB = async () => {
    try {
      await mongoose.connect(db);
      logger.info("Connected to MongoDB...");
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  };