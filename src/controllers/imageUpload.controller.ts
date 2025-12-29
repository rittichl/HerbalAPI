import { Request, Response } from 'express';
import msg from '../constants/msg.json';
import { getImageUrl } from '../utility/fileUpload';
import fs from 'fs';
import path from 'path';

export const imageUploadController = {
    // Upload single image
    uploadImage: async (req: Request, res: Response) => {
        // console.log("Req file:", req.file);
        try {
            if (!req.file) {
                return res.json({
                    code: 113,
                    message: msg["113"],
                    detail: 'No file uploaded'
                });
            }

            const imageUrl = getImageUrl(req.file.filename);

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    url: imageUrl,
                    mimetype: req.file.mimetype
                }
            });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Upload multiple images
    uploadMultipleImages: async (req: Request, res: Response) => {
        try {
            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return res.json({
                    code: 113,
                    message: msg["113"],
                    detail: 'No files uploaded'
                });
            }

            const files = req.files as Express.Multer.File[];
            const uploadedFiles = files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                url: getImageUrl(file.filename),
                mimetype: file.mimetype
            }));

            return res.json({
                code: 0,
                message: msg["0"],
                data: uploadedFiles
            });

        } catch (error) {
            console.error('Upload error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Delete image
    deleteImage: async (req: Request, res: Response) => {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '../uploads/images', filename);

            if (!fs.existsSync(filePath)) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'File not found'
                });
            }

            fs.unlinkSync(filePath);

            return res.json({
                code: 0,
                message: msg["0"],
                data: { deleted: filename }
            });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get image list (optional)
    getImages: async (req: Request, res: Response) => {
        try {
            const uploadDir = path.join(__dirname, '../uploads/images');
            const files = fs.readdirSync(uploadDir);

            const imageList = files.map(file => ({
                filename: file,
                url: getImageUrl(file),
                path: path.join(uploadDir, file)
            }));

            return res.json({
                code: 0,
                message: msg["0"],
                data: imageList
            });

        } catch (error) {
            console.error('List error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    }
};