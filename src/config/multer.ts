import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage with Thai language support
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const templatesDir = path.join(process.cwd(), 'templates');
        cb(null, templatesDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        // Preserve original filename with Thai characters
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName);
        const baseName = path.basename(originalName, fileExtension);

        // Keep Thai characters and only remove problematic characters
        const cleanName = baseName
            .replace(/[<>:"/\\|?*]/g, '') // Remove Windows forbidden characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .normalize('NFD') // Normalize unicode
            .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics (optional)

        const timestamp = Date.now();

        // Use original Thai name if possible, otherwise use cleaned version
        const finalFilename = `${cleanName}${fileExtension}`;

        cb(null, finalFilename);
    }
});

// Enhanced file filter with better MIME type detection
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/octet-stream' // Fallback for some Word files
    ];

    const allowedExtensions = ['.docx', '.doc'];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check both MIME type and file extension
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (isValidMimeType && isValidExtension) {
        cb(null, true);
    } else if (file.mimetype === 'application/octet-stream' && isValidExtension) {
        // Allow octet-stream if extension is correct (common for some Word files)
        cb(null, true);
    } else {
        cb(new Error(`Only Word documents (.docx, .doc) are allowed. Received: ${file.mimetype} ${fileExtension}`));
    }
};

// Configure multer with Thai support
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1, // Only one file per upload
        fieldNameSize: 200, // Increased for Thai characters
    },
    preservePath: true
});

export default upload;