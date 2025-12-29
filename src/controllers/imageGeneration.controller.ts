import { Request, Response } from 'express';
import { ImageGenerator, TextElement } from '../utility/imageGenerator';
import msg from '../constants/msg.json';
import path from 'path';
import fs from 'fs';
import { LabelTemplate } from '../models/labelTemplate.model';
import { LabelElement } from '../models/labelElement.model';

export const imageGenerationController = {
    // Generate image from template ID and dynamic data
    generateFromTemplate: async (req: Request, res: Response) => {
        try {
            const { templateId, dynamicData } = req.body;

            // Get template from database
            const template = await LabelTemplate.findByPk(templateId, {
                include: [{
                    model: LabelElement,
                    as: 'elements',
                    attributes: ['id', 'elementId', 'label', 'x', 'y']
                }]
            });

            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            if (!template.imageUrl) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Template has no base image'
                });
            }

            // Prepare text elements with dynamic data
            const textElements: TextElement[] = template.elements.map((element: { label: any; elementId: any; x: any; y: any; }) => {
                let labelText = element.label;

                // Replace placeholders with dynamic data
                if (dynamicData) {
                    Object.keys(dynamicData).forEach(key => {
                        labelText = labelText.replace(`{${key}}`, dynamicData[key]);
                    });
                }

                return {
                    id: element.elementId,
                    label: labelText,
                    x: element.x,
                    y: element.y,
                    fontSize: 24,
                    fontFamily: 'Arial',
                    color: '#000000',
                    maxWidth: 300
                };
            });

            // Generate output filename
            const outputFilename = `generated-${Date.now()}.png`;
            const outputPath = path.join(__dirname, '../uploads/generated', outputFilename);

            // Ensure directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Generate the image
            const imagePath = path.join(__dirname, '..', template.imageUrl);
            await ImageGenerator.generateLabelImage({
                imagePath: imagePath,
                outputPath: outputPath,
                elements: textElements,
                canvasWidth: template.canvasWidth,
                canvasHeight: template.canvasHeight
            });

            const imageUrl = `/uploads/generated/${outputFilename}`;

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    imageUrl: imageUrl,
                    downloadUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
                    elements: textElements
                }
            });

        } catch (error) {
            console.error('Image generation error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Generate image from uploaded file and custom elements
    generateFromUpload: async (req: Request, res: Response) => {
        try {
            const { elements, canvasSize } = req.body;

            if (!req.file) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'No image uploaded'
                });
            }

            if (!elements || !Array.isArray(elements)) {
                // Clean up uploaded file
                const filePath = path.join(__dirname, '../uploads/images', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Elements array is required'
                });
            }

            // Parse elements if they come as JSON string
            const textElements: TextElement[] = typeof elements === 'string'
                ? JSON.parse(elements)
                : elements;

            // Generate output filename
            const outputFilename = `custom-generated-${Date.now()}.png`;
            const outputPath = path.join(__dirname, '../uploads/generated', outputFilename);

            // Ensure directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Generate the image
            const imagePath = path.join(__dirname, '../uploads/images', req.file.filename);
            await ImageGenerator.generateLabelImage({
                imagePath: imagePath,
                outputPath: outputPath,
                elements: textElements,
                canvasWidth: canvasSize?.width,
                canvasHeight: canvasSize?.height
            });

            const imageUrl = `/uploads/generated/${outputFilename}`;

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    imageUrl: imageUrl,
                    downloadUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
                    elements: textElements
                }
            });

        } catch (error) {
            console.error('Custom image generation error:', error);

            // Clean up uploaded file on error
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads/images', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Download generated image
    downloadImage: async (req: Request, res: Response) => {
        try {
            const { filename } = req.params;
            const filePath = path.join(__dirname, '../uploads/generated', filename);

            if (!fs.existsSync(filePath)) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'File not found'
                });
            }

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);

        } catch (error) {
            console.error('Download error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    }
};