import path from 'path';
import fs from 'fs';
import app from './app';
import { InitialController } from './controllers/initial.data.controller';
import db from './models/db';
import dotenv from 'dotenv';
import Logger from './middleware/logger';

dotenv.config();

const port = process.env.PORT || 3000;


const startServer = async () => {
    try {

        const uploadDirs = [
            path.join(process.cwd(), 'uploads/images'),
            path.join(process.cwd(), 'uploads/generated/previews')
        ];

        uploadDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`Created directory: ${dir}`);
            }
        });

        await db.sequelize.authenticate();
        console.log('Database connection established');

        // Sync models with database
        await db.sequelize.sync({ alter: true });
        console.log('Database synchronized');

        await InitialController.createDefaultUserGroup();
        await InitialController.createAdminUser();

        // Start server
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Unable to start application:', error);
        process.exit(1);
    }
};

// Add global error handler
process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', null, null, { promise, reason });
});

process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception thrown:', null, null, error);
    process.exit(1);
});

startServer();