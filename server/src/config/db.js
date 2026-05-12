import mongoose from 'mongoose';
import{ MONGO_URI, DB_NAME } from '../constants/getenv.js';
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
    });

    console.log(` MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn(' MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error(' MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;