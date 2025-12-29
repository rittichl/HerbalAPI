import { Request, Response } from 'express';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
const ImageModule: any = require('docxtemplater-image-module-free');
import { ImageModuleConfig } from '../config/imageModule';

// Types
interface GenerateDocumentRequest {
    templateName: string;
    data: any;
    images?: { [key: string]: string }; // Base64 images or file paths
}

interface TemplateInfo {
    name: string;
    filename: string;
    size: number;
    uploadedAt: string;
}

export class DocumentController {

    /**
   * Helper method to create a safe ASCII filename for headers
   */
    private static getSafeFilename(filename: string): string {
        // Extract base name without extension
        const baseName = path.basename(filename, '.docx');
        const extension = '.docx';

        // Create safe ASCII name by removing non-ASCII characters
        const safeName = baseName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with underscore
            .replace(/_+/g, '_') // Replace multiple underscores with single
            .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

        // If safe name is empty, use a default name
        return safeName ? safeName + extension : 'template.docx';
    }

    /**
     * Download template file with safe headers
     */
    static async downloadTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            // Security: Basic filename validation
            if (!filename || filename.includes('..') || !filename.endsWith('.docx')) {
                res.status(400).json({
                    error: 'Invalid filename'
                });
                return;
            }

            const templatesDir = path.join(process.cwd(), 'templates');
            const filePath = path.join(templatesDir, filename);

            // Check if template exists
            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    error: 'Template not found'
                });
                return;
            }

            // Get file stats for headers
            const stats = fs.statSync(filePath);

            // Create a safe ASCII filename for download
            const safeDownloadName = 'document_template.docx';

            // Set only safe ASCII headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Length', stats.size.toString());
            res.setHeader('Content-Disposition', `attachment; filename="${safeDownloadName}"`);
            res.setHeader('Cache-Control', 'no-cache');

            // Remove problematic custom headers with non-ASCII characters
            // Or encode them properly if needed
            // res.setHeader('X-File-Name', filename); // REMOVED - contains Thai chars
            res.setHeader('X-File-Size', stats.size.toString()); // Safe - only numbers
            res.setHeader('X-File-Type', 'word-template'); // Safe - ASCII only

            // Create read stream and pipe to response
            const fileStream = fs.createReadStream(filePath);

            fileStream.on('error', (error) => {
                console.error('Error streaming template file:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Error downloading template file'
                    });
                }
            });

            fileStream.pipe(res);

        } catch (error) {
            console.error('Error downloading template:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to download template',
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    }

    /**
     * Generate document from template
     */
    static async generateDocument(req: Request, res: Response): Promise<void> {
        try {
            const { templateName, data, images }: GenerateDocumentRequest = req.body;

            // Input validation
            if (!templateName || !data) {
                res.status(400).json({
                    error: 'templateName and data are required'
                });
                return;
            }

            // Define paths
            const templatesDir = path.join(process.cwd(), 'templates');
            const generatedDir = path.join(process.cwd(), 'generated');
            const uploadsDir = path.join(process.cwd(), 'uploads');

            const templatePath = path.join(templatesDir, `${templateName}.docx`);
            const outputFilename = `document-${Date.now()}.docx`;
            const outputPath = path.join(generatedDir, outputFilename);

            // Check if template exists
            if (!fs.existsSync(templatePath)) {
                res.status(404).json({
                    error: `Template '${templateName}' not found`
                });
                return;
            }

            // Ensure directories exist
            if (!fs.existsSync(generatedDir)) {
                fs.mkdirSync(generatedDir, { recursive: true });
            }
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Read the template file
            const content = fs.readFileSync(templatePath, 'binary');

            const zip = new PizZip(content);

            // Prepare modules
            const modules: any[] = [];

            // Add image module if images are provided
            if (images && Object.keys(images).length > 0) {
                const imageModule = ImageModuleConfig.getImageModule();
                modules.push(imageModule);
            }

            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                modules: modules
            });

            // Process images - save base64 images to files if needed
            const processedData = { ...data };
            if (images) {
                for (const [key, imageData] of Object.entries(images)) {
                    if (imageData.startsWith('data:image/')) {
                        // Save base64 image to file and update data to use file path
                        const filename = `image_${Date.now()}_${key}.png`;
                        const imagePath = path.join(uploadsDir, filename);

                        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                        fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));

                        processedData[key] = imagePath;
                    } else {
                        processedData[key] = imageData;
                    }
                }
            }

            // Set the template variables
            doc.render(processedData);

            // Generate the output document
            const buf: Buffer = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            }) as Buffer;

            // Save the generated document
            fs.writeFileSync(outputPath, buf);

            const response = {
                success: true,
                message: 'Document generated successfully',
                filename: outputFilename,
                downloadUrl: `/herbal/api/documents/download/${outputFilename}`
            };

            res.json(response);

        } catch (error) {
            console.error('Error generating document:', error);
            res.status(500).json({
                error: 'Failed to generate document',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Download generated document
     */
    static async downloadDocument(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            // Security: Basic filename validation
            if (!filename || filename.includes('..') || !filename.endsWith('.docx')) {
                res.status(400).json({
                    error: 'Invalid filename'
                });
                return;
            }

            const generatedDir = path.join(process.cwd(), 'generated');
            const filePath = path.join(generatedDir, filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    error: 'File not found'
                });
                return;
            }

            // Set appropriate headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            // Send the file
            res.sendFile(filePath);

        } catch (error) {
            console.error('Error downloading document:', error);
            res.status(500).json({
                error: 'Failed to download document'
            });
        }
    }

    /**
     * List available templates
     */
    // static async listTemplates(req: Request, res: Response): Promise<void> {
    //     try {
    //         const templatesDir = path.join(process.cwd(), 'templates');

    //         // Create templates directory if it doesn't exist
    //         if (!fs.existsSync(templatesDir)) {
    //             fs.mkdirSync(templatesDir, { recursive: true });
    //             const response = { templates: [] };
    //             res.json(response);
    //             return;
    //         }

    //         const files: string[] = fs.readdirSync(templatesDir);
    //         const templates: TemplateInfo[] = files
    //             .filter(file => file.endsWith('.docx'))
    //             .map(file => {
    //                 const filePath = path.join(templatesDir, file);
    //                 const stats = fs.statSync(filePath);

    //                 return {
    //                     name: path.basename(file, '.docx'),
    //                     filename: file,
    //                     size: stats.size,
    //                     uploadedAt: stats.birthtime.toISOString()
    //                 };
    //             });

    //         const response = { templates };
    //         res.json(response);

    //     } catch (error) {
    //         console.error('Error listing templates:', error);
    //         res.status(500).json({
    //             error: 'Failed to list templates'
    //         });
    //     }
    // }
    /**
 * List available templates with download URLs
 */
    static async listTemplates(req: Request, res: Response): Promise<void> {
        try {
            const templatesDir = path.join(process.cwd(), 'templates');

            // Create templates directory if it doesn't exist
            if (!fs.existsSync(templatesDir)) {
                fs.mkdirSync(templatesDir, { recursive: true });
                const response = { templates: [] };
                res.json(response);
                return;
            }

            const files: string[] = fs.readdirSync(templatesDir);
            const templates = files
                .filter(file => file.endsWith('.docx'))
                .map(file => {
                    const filePath = path.join(templatesDir, file);
                    const stats = fs.statSync(filePath);

                    return {
                        name: path.basename(file, '.docx'),
                        filename: file,
                        size: stats.size,
                        uploadedAt: stats.birthtime.toISOString(),
                        downloadUrl: `/herbal/api/documents/templates/download/${file}` // Add download URL
                    };
                });

            const response = { templates };
            res.json(response);

        } catch (error) {
            console.error('Error listing templates:', error);
            res.status(500).json({
                error: 'Failed to list templates'
            });
        }
    }

    /**
     * Upload template document
     */
    static async uploadTemplate(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
                return;
            }

            const file = req.file;
            const templatesDir = path.join(process.cwd(), 'templates');
            const filePath = path.join(templatesDir, file.filename);

            // Verify file was actually saved
            if (!fs.existsSync(filePath)) {
                res.status(500).json({
                    success: false,
                    error: 'File was not saved properly'
                });
                return;
            }

            // Get file stats for response
            const stats = fs.statSync(filePath);

            const templateInfo: TemplateInfo = {
                name: path.basename(file.filename, path.extname(file.filename)),
                filename: file.filename,
                size: stats.size,
                uploadedAt: stats.birthtime.toISOString()
            };

            const response = {
                success: true,
                message: 'Template uploaded successfully',
                template: templateInfo,
                originalName: file.originalname // Include original name for reference
            };

            res.status(201).json(response);

        } catch (error) {
            console.error('Error uploading template:', error);

            // Clean up file if there was an error
            if (req.file) {
                const filePath = path.join(process.cwd(), 'templates', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            res.status(500).json({
                success: false,
                error: 'Failed to upload template',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Delete template
     */
    static async deleteTemplate(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            // Security: Basic filename validation
            if (!filename || filename.includes('..') || !filename.endsWith('.docx')) {
                res.status(400).json({
                    error: 'Invalid filename'
                });
                return;
            }

            const templatesDir = path.join(process.cwd(), 'templates');
            const filePath = path.join(templatesDir, filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    error: 'Template not found'
                });
                return;
            }

            // Delete the file
            fs.unlinkSync(filePath);

            const response = {
                success: true,
                message: 'Template deleted successfully'
            };

            res.json(response);

        } catch (error) {
            console.error('Error deleting template:', error);
            res.status(500).json({
                error: 'Failed to delete template',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get template info
     */
    static async getTemplateInfo(req: Request, res: Response): Promise<void> {
        try {
            const { filename } = req.params;

            // Security: Basic filename validation
            if (!filename || filename.includes('..') || !filename.endsWith('.docx')) {
                res.status(400).json({
                    error: 'Invalid filename'
                });
                return;
            }

            const templatesDir = path.join(process.cwd(), 'templates');
            const filePath = path.join(templatesDir, filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                res.status(404).json({
                    error: 'Template not found'
                });
                return;
            }

            const stats = fs.statSync(filePath);
            const templateInfo: TemplateInfo = {
                name: path.basename(filename, '.docx'),
                filename: filename,
                size: stats.size,
                uploadedAt: stats.birthtime.toISOString()
            };

            res.json({
                success: true,
                template: templateInfo
            });

        } catch (error) {
            console.error('Error getting template info:', error);
            res.status(500).json({
                error: 'Failed to get template info'
            });
        }
    }

    /**
 * Upload image for use in documents
 */
    static async uploadImage(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({
                    error: 'No image uploaded'
                });
                return;
            }

            const response = {
                success: true,
                message: 'Image uploaded successfully',
                image: {
                    filename: req.file.filename,
                    path: `/uploads/${req.file.filename}`,
                    fullPath: path.join(process.cwd(), 'uploads', req.file.filename),
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            };

            res.status(201).json(response);

        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({
                error: 'Failed to upload image',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

}