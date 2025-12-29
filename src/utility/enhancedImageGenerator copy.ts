import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';

export interface LabelElement {
    id: number;
    elementId: number;
    label: string;
    x: number;
    y: number;
}

export interface GenerateLabelOptions {
    imagePath: string;
    outputPath: string;
    elements: LabelElement[];
    dynamicData: {
        register_no: string;
        lot_no: string;
        production_date: string;
        expiry_date: string;
        qr_data?: string;
    };
    canvasWidth?: number;
    canvasHeight?: number;
}

export class EnhancedImageGenerator {
    static async generateLabelImage(options: GenerateLabelOptions): Promise<string> {
        try {
            // Load the base image
            const image = await loadImage(options.imagePath);

            // Create canvas with specified dimensions or use image dimensions
            const canvasWidth = options.canvasWidth || image.width;
            const canvasHeight = options.canvasHeight || image.height;

            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            // Draw the base image
            ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

            // Process each element
            for (const element of options.elements) {
                await this.processElement(ctx, element, options.dynamicData, canvas);
            }

            // Save the generated image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(options.outputPath, buffer);

            return options.outputPath;

        } catch (error) {
            console.error('Label image generation error:', error);
            throw new Error(`Failed to generate label image: ${error}`);
        }
    }

    private static async processElement(ctx: any, element: LabelElement, dynamicData: any, canvas: any): Promise<void> {
        switch (element.elementId) {
            case 1: // QR Code
                await this.drawQRCode(ctx, element, dynamicData, canvas);
                break;
            case 2: // Register No
                this.drawText(ctx, element, dynamicData.register_no || element.label);
                break;
            case 3: // Lot No
                this.drawText(ctx, element, dynamicData.lot_no || element.label);
                break;
            case 4: // Production Date
                this.drawText(ctx, element, dynamicData.production_date || element.label);
                break;
            case 5: // Expiry Date
                this.drawText(ctx, element, dynamicData.expiry_date || element.label);
                break;
            default:
                this.drawText(ctx, element, element.label);
        }
    }

    private static async drawQRCode(ctx: any, element: LabelElement, dynamicData: any, canvas: any): Promise<void> {
        try {
            const qrData = dynamicData.qr_data || "https://delight-herbal-house.com/info/?qr=MDEtRzE4Nnw2Ny0x";

            // Generate QR code as data URL
            const qrDataUrl = await QRCode.toDataURL(qrData, {
                width: 150,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            // Create image from QR code data URL
            const qrImage = await loadImage(qrDataUrl);

            // Draw QR code at specified position
            ctx.drawImage(qrImage, element.x, element.y, 150, 150);

        } catch (error) {
            console.error('QR code generation error:', error);
            // Fallback: draw text instead of QR code
            this.drawText(ctx, element, 'QR Code');
        }
    }

    private static drawText(ctx: any, element: LabelElement, text: string): void {
        // Set font styles for text elements
        ctx.font = '24px Arial';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Draw the text
        ctx.fillText(text, element.x, element.y);
    }

    // Utility to format dates if needed
    static formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }
}