import * as dotenv from 'dotenv';

dotenv.config();


interface Config {
    NODE_ENV: string;
    PORT: number;
    APIKEY: string,
    DB: {
        NAME: string;
        USER: string;
        PASSWORD: string;
        HOST: string;
        PORT: number;
    };
    JWT: {
        SECRET: string;
        EXPIRES: string | number;  // Can be string ('2d') or number (in seconds)
        COOKIE_EXPIRES: number;
    };
}



const config: Config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000'),
    APIKEY: process.env.API_KEY || '',
    DB: {
        NAME: process.env.DB_NAME || 'herbal',
        USER: process.env.DB_USER || 'postgres',
        PASSWORD: process.env.DB_PASSWORD || 'postgres',
        HOST: process.env.DB_HOST || 'localhost',
        PORT: parseInt(process.env.DB_PORT || '5432')
    },
    JWT: {
        SECRET: process.env.JWT_SECRET || 'your-secret-key',
        EXPIRES: process.env.JWT_EXPIRES || '30d',
        COOKIE_EXPIRES: parseInt(process.env.JWT_COOKIE_EXPIRES || '30')
    }
};

export default config;