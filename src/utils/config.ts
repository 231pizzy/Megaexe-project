import dotenv from 'dotenv';
dotenv.config();

export const config = {
    MONGO_URL: process.env.MONGO_URL || '',
    PORT: parseInt(process.env.PORT || '5000', 10),
};

export default config;