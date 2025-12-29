import { Router } from 'express';
import { auth, chkApiKey, authenController } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Authentication
router.post('/auth/login', chkApiKey, validatePostData(['username', 'password']), authenController.login);
router.get('/auth/logout', chkApiKey, authenController.logout);

export default router;

