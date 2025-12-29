import express from 'express';
import dotenv from 'dotenv';
import db from './models/db';
import { router } from './routes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/herbal/api', router);

async function initializeApp() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection established');

        // Sync models with database
        await db.sequelize.sync({ alter: true });
        console.log('Database synchronized');

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start application:', error);
        process.exit(1);
    }
}

initializeApp();