import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { MisLabelTemplate } from '../models/labelTemplate.model';
import sizeOf from 'image-size';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Interface for image dimensions
export interface ImageDimensions {
    width: number;
    height: number;
    type: string;
    orientation?: number;
}

// Helper function to predict next template ID
const predictNextTemplateId = async (): Promise<number> => {
    try {
        const lastTemplate = await MisLabelTemplate.findOne({
            order: [['id', 'DESC']],
            attributes: ['id']
        });

        console.log('Last template found:', lastTemplate ? lastTemplate.id : 'None');
        return lastTemplate ? lastTemplate.id + 1 : 1;
    } catch (error) {
        console.error('Error predicting next template ID:', error);
        return Date.now();
    }
};

// Helper function to parse form data from request
const parseFormData = (req: Request): { register_no?: string; sticker_no?: string } => {
    try {
        if (req.body.form) {
            return JSON.parse(req.body.form);
        }
    } catch (error) {
        console.warn('Could not parse form data:', error);
    }
    return {};
};

// Function to get image dimensions
export const getImageDimensions = (filePath: string): Promise<ImageDimensions> => {
    return new Promise((resolve, reject) => {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const dimensions = sizeOf(fileBuffer);
            if (dimensions.width && dimensions.height) {
                resolve({
                    width: dimensions.width,
                    height: dimensions.height,
                    type: dimensions.type || 'unknown',
                    orientation: dimensions.orientation
                });
            } else {
                reject(new Error('Could not determine image dimensions'));
            }
        } catch (error) {
            reject(error);
        }
    });
};

// Configure storage with predictable filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: async (req, file, cb) => {
        try {
            // Parse form data to get register_no and sticker_no
            const formData = parseFormData(req);
            const register_no = formData.register_no || 'unknown';
            const sticker_no = formData.sticker_no || 'unknown';

            // Predict the next template ID
            const nextId = await predictNextTemplateId();
            console.log('Predicted next template ID:', nextId);

            // Generate standardized filename
            const extension = path.extname(file.originalname);
            const finalFilename = `${nextId}_${register_no}_${sticker_no}${extension}`;

            console.log('Generated filename:', finalFilename);
            cb(null, finalFilename);

        } catch (error) {
            console.error('Error generating filename, falling back to unique name:', error);

            // Fallback: generate unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + extension);
        }
    }
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

// Helper function to get image URL
export const getImageUrl = (filename: string): string => {
    return `/uploads/images/${filename}`;
};

// Helper function to generate standardized filename manually
export const generateStandardizedFilename = (
    templateId: number,
    registerNo: string,
    stickerNo: string,
    originalFilename?: string
): string => {
    const extension = originalFilename ? path.extname(originalFilename) : '.png';
    const safeRegisterNo = registerNo.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeStickerNo = stickerNo.replace(/[^a-zA-Z0-9_-]/g, '_');

    return `${templateId}_${safeRegisterNo}_${safeStickerNo}${extension}`;
};

// Helper function to validate if a filename follows the standardized pattern
export const isValidStandardizedFilename = (filename: string): boolean => {
    const pattern = /^\d+_[a-zA-Z0-9_-]+_[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif|webp)$/i;
    return pattern.test(filename);
};

// Helper function to parse components from standardized filename
export const parseStandardizedFilename = (filename: string): {
    templateId: number;
    registerNo: string;
    stickerNo: string;
    extension: string;
} | null => {
    const match = filename.match(/^(\d+)_([^_]+)_([^_]+)\.(.+)$/);
    if (!match) return null;

    return {
        templateId: parseInt(match[1], 10),
        registerNo: match[2],
        stickerNo: match[3],
        extension: match[4]
    };
};

// Middleware to extract image dimensions and add to request
export const extractImageDimensions = async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        try {
            const filePath = path.join(uploadDir, req.file.filename);
            const dimensions = await getImageDimensions(filePath);

            // Add dimensions to the file object
            (req.file as any).dimensions = dimensions;
            console.log('Image dimensions:', dimensions);

        } catch (error) {
            console.error('Error extracting image dimensions:', error);
            // Continue without dimensions rather than failing the upload
            (req.file as any).dimensions = null;
        }
    }
    next();
};