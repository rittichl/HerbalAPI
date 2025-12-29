import express from 'express'
// import AppRoute from './routes/index.js'
import { router } from './routes';
import path from 'path';
import { fileURLToPath } from 'url';




class App {
    public server

    constructor() {
        this.server = express()
        this.middlewares()
        this.routes()
    }


    middlewares() {
        this.server.use(express.json())

        // Get __dirname equivalent in ES modules
        // const __filename = fileURLToPath(import.meta.url);
        // const __dirname = path.dirname(__filename);

        // Serve static files (uploads) - corrected path
        // this.server.use('/uploads', express.static(path.join(__dirname, '/uploads')));
        this.server.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
        // this.server.use('/uploads', express.static(path.join(process.cwd(), '/uploads')));



        // this.server.use(function (req, res, next) {

        //     res.header('Access-Control-Allow-Origin', '*')
        //     res.header(
        //         'Access-Control-Allow-Methods',
        //         'GET,HEAD,PUT,PATCH,POST,DELETE'
        //     )
        //     next()
        // })



        // Enhanced CORS middleware
        this.server.use(function (req, res, next) {
            // Allow from any origin (or specify your frontend URL)
            res.header('Access-Control-Allow-Origin', '*');

            // Allowed methods
            res.header(
                'Access-Control-Allow-Methods',
                'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS'
            );

            // Allowed headers (include content-Type and api-key)
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization, api-key'
            );

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }

            next();
        });
    }



    routes() {
        this.server.use('/herbal/api', router)
    }


}



// const crypto = require('crypto');

// const jwtSecret = crypto.randomBytes(32).toString('hex');
// console.log(jwtSecret);


export default new App().server
