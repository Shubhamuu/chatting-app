import dotenv from 'dotenv';
dotenv.config();
export const ACCESS_SECRET = process.env.ACCESS_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI;
export const DB_NAME = process.env.DB_NAME;

export const frontendURL = process.env.FRONTEND_URL;