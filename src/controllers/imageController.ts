import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Types
interface ImageInfo {
    filename: string;
    originalName: string;
    path: string;
    fullPath: string;
    size: number;
    mimetype: string;
    uploadedAt: string;
    dimensions?: {
        width: number;
        height: number;
    };
}

export class ImageController {
    private static imagesDir = path.join(process.cwd(), 'uploads');

    /**
     * Ensure uploads directory exists
     */
    private static ensureImagesDir(): void {
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }
    }

    /**
     * Get image information
     */
    private static getImageInfo(filename: string): ImageInfo | null {
        try {
            const filePath = path.join(this.imagesDir, filename);

            if (!fs.existsSync(filePath)) {
                return null;
            }

            const stats = fs.statSync(filePath);

            // Try to get image dimensions (optional)
            let dimensions;
            try {
                // Use dynamic import to avoid requiring at top level
                const sizeOf = require('image-size');
                dimensions = sizeOf(filePath);
            } catch (error) {
                // Dimensions are optional, so we can continue without them
                console.warn('Could not get image dimensions for:', filename);
            }

            return {
                filename: filename,
                originalName: filename,
                path: `/uploads/${filename}`,
                fullPath: filePath,
                size: stats.size,
                mimetype: ImageController.getMimeType(filename), // Fixed: use class name
                uploadedAt: stats.birthtime.toISOString(),
                dimensions: dimensions ? {
                    width: dimensions.width,
                    height: dimensions.height
                } : undefined
            };
        } catch (error) {
            console.error('Error getting image info:', error);
            return null;
        }
    }

    /**
     * Get MIME type from filename
     */
    private static getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Check if file is an image based on extension
     */
    private static isImageFile(filename: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        const ext = path.extname(filename).toLowerCase();
        return imageExtensions.includes(ext);
    }

    /**
     * List all images
     */
    static async listImages(req: Request, res: Response): Promise<void> {
        try {
            ImageController.ensureImagesDir(); // Fixed: use class name

            const files = fs.readdirSync(ImageController.imagesDir); // Fixed: use class name
            const images: ImageInfo[] = [];

            for (const file of files) {
                // Only include files (not directories) and image files
                const filePath = path.join(ImageController.imagesDir, file); // Fixed: use class name
                const stats = fs.statSync(filePath);

                if (stats.isFile() && ImageController.isImageFile(file)) { // Fixed: use class name
                    const imageInfo = ImageController.getImageInfo(file); // Fixed: use class name
                    if (imageInfo) {
                        images.push(imageInfo);
                    }
                }
            }

            // Sort by upload date (newest first)
            images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

            const response = {
                success: true,
                images: images,
                total: images.length
            };

            res.json(response);

        } catch (error) {
            console.error('Error listing images:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to list images',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get specific image info
     */
    static async getImage(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            if (!filename || filename.includes('..')) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid filename'
                });
                return;
            }

            const imageInfo = ImageController.getImageInfo(filename); // Fixed: use class name

            if (!imageInfo) {
                res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
                return;
            }

            const response = {
                success: true,
                image: imageInfo
            };

            res.json(response);

        } catch (error) {
            console.error('Error getting image info:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get image info'
            });
        }
    }

    /**
     * Delete image
     */
    static async deleteImage(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            if (!filename || filename.includes('..')) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid filename'
                });
                return;
            }

            const filePath = path.join(ImageController.imagesDir, filename); // Fixed: use class name

            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
                return;
            }

            // Check if it's actually an image file
            if (!ImageController.isImageFile(filename)) { // Fixed: use class name
                res.status(400).json({
                    success: false,
                    error: 'File is not an image'
                });
                return;
            }

            // Delete the file
            fs.unlinkSync(filePath);

            const response = {
                success: true,
                message: 'Image deleted successfully'
            };

            res.json(response);

        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete image',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete multiple images
     */
    static async deleteMultipleImages(req: Request, res: Response): Promise<void> {
        try {
            const { filenames } = req.body;

            if (!Array.isArray(filenames) || filenames.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'filenames array is required'
                });
                return;
            }

            const results = {
                success: [] as string[],
                failed: [] as string[]
            };

            for (const filename of filenames) {
                if (filename.includes('..')) {
                    results.failed.push(`${filename} - Invalid filename`);
                    continue;
                }

                const filePath = path.join(ImageController.imagesDir, filename); // Fixed: use class name

                try {
                    if (fs.existsSync(filePath) && ImageController.isImageFile(filename)) { // Fixed: use class name
                        fs.unlinkSync(filePath);
                        results.success.push(filename);
                    } else {
                        results.failed.push(`${filename} - File not found or not an image`);
                    }
                } catch (error) {
                    results.failed.push(`${filename} - ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            res.json({
                success: true,
                message: `Deleted ${results.success.length} images successfully`,
                results: results
            });

        } catch (error) {
            console.error('Error deleting multiple images:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete images',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Serve image file
     */
    static async serveImage(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            if (!filename || filename.includes('..')) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid filename'
                });
                return;
            }

            const filePath = path.join(ImageController.imagesDir, filename); // Fixed: use class name

            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
                return;
            }

            if (!ImageController.isImageFile(filename)) { // Fixed: use class name
                res.status(400).json({
                    success: false,
                    error: 'File is not an image'
                });
                return;
            }

            // Set appropriate headers
            const mimeType = ImageController.getMimeType(filename); // Fixed: use class name
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

            // Send the file
            res.sendFile(filePath);

        } catch (error) {
            console.error('Error serving image:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to serve image'
            });
        }
    }

    /**
     * Get image as base64
     */
    static async getImageBase64(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            if (!filename || filename.includes('..')) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid filename'
                });
                return;
            }

            const filePath = path.join(ImageController.imagesDir, filename); // Fixed: use class name

            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
                return;
            }

            if (!ImageController.isImageFile(filename)) { // Fixed: use class name
                res.status(400).json({
                    success: false,
                    error: 'File is not an image'
                });
                return;
            }

            // Read image file
            const imageBuffer = fs.readFileSync(filePath);
            const mimeType = ImageController.getMimeType(filename); // Fixed: use class name
            const base64String = imageBuffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64String}`;

            const response = {
                success: true,
                dataUrl: dataUrl,
                mimeType: mimeType,
                filename: filename
            };

            res.json(response);

        } catch (error) {
            console.error('Error converting image to base64:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to convert image to base64'
            });
        }
    }
}