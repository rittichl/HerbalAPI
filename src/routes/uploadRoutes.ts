import { Router } from 'express';
import { imageUploadController } from '../controllers/imageUpload.controller';
import { auth } from '../controllers/auth.controller';
import { upload } from '../utility/fileUpload';

const router = Router();

// Image Upload
router.post('/upload/image', auth, upload.single('image'), imageUploadController.uploadImage);

export default router;

