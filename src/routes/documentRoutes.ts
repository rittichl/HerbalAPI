import { Router } from 'express';
import { DocumentController } from '../controllers/documents.controller';
import { ImageController } from '../controllers/imageController'; // Add this import
import upload from '../config/multer';
import { auth } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';
import multer from 'multer';
import path from 'path';

const router: Router = Router();

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `image_${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// ===== IMAGE MANAGEMENT ROUTES =====

// List all images
router.get('/images', auth, ImageController.listImages);

// Get specific image info
router.get('/images/:filename', auth, ImageController.getImage);

// Upload image
router.post('/images/upload', auth, imageUpload.single('image'), DocumentController.uploadImage);

// Serve image file (public access)
router.get('/images/serve/:filename', ImageController.serveImage);

// Get image as base64
router.get('/images/base64/:filename', auth, ImageController.getImageBase64);

// Delete image
router.delete('/images/:filename', auth, ImageController.deleteImage);

// Delete multiple images
router.delete('/images', auth, ImageController.deleteMultipleImages);

// ===== DOCUMENT TEMPLATE ROUTES =====

// Generate document from template
router.post('/generate', auth, validatePostData(['templateName', 'data']), DocumentController.generateDocument);

// Download generated document
router.get('/download/:filename', auth, DocumentController.downloadDocument);

// Download template file
router.get('/templates/download/:filename', auth, DocumentController.downloadTemplate);

// List available templates
router.get('/templates', auth, DocumentController.listTemplates);

// Upload template document
router.post('/templates/upload', auth, upload.single('template'), DocumentController.uploadTemplate);

// Delete template
router.delete('/templates/:filename', auth, DocumentController.deleteTemplate);

// Get template info
router.get('/templates/:filename', auth, DocumentController.getTemplateInfo);

export default router;