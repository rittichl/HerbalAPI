import express from 'express'
import { router } from './routes';
import path from 'path';
import { fileURLToPath } from 'url';
import documentRoutes from './routes/documentRoutes';
import { requestLogger, transactionIdMiddleware } from './middleware/logger';



class App {
    public server

    constructor() {
        this.server = express()
        this.middlewares()
        this.routes()
    }


    middlewares() {
        // Add request logging middleware first
        this.server.use(transactionIdMiddleware);
        this.server.use(requestLogger);

        this.server.use(express.json())

        this.server.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
        this.server.use('/templates', express.static(path.join(process.cwd(), 'templates')));
        this.server.use('/generated', express.static(path.join(process.cwd(), 'generated')));


        // Enhanced CORS middleware
        this.server.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header(
                'Access-Control-Allow-Methods',
                'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS'
            );
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization, api-key'
            );
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            next();
        });
    }



    routes() {
        this.server.use('/herbal/api', router)
        this.server.use('/herbal/api/documents', documentRoutes);
    }


}



// const crypto = require('crypto');

// const jwtSecret = crypto.randomBytes(32).toString('hex');
// console.log(jwtSecret);


export default new App().server
