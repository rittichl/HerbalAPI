import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import base64 from 'base-64';

export interface LabelElement {
    id: number;
    elementId: number;
    label: string;
    x: number;
    y: number;
    size?: number;
    bold?: boolean;
    color?: string;
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
        sticker_no?: string;
    };
    // canvasWidth?: number;
    // canvasHeight?: number;
}

export class EnhancedImageGenerator {
    static async generateLabelImage(options: GenerateLabelOptions): Promise<string> {
        try {
            // Load the base image
            const image = await loadImage(options.imagePath);

            console.log("qr_xxxxxx ", options.dynamicData.qr_data)

            // Use ACTUAL image dimensions instead of canvasSize
            const canvasWidth = image.width;
            const canvasHeight = image.height;

            console.log(`Using actual image dimensions: ${canvasWidth}x${canvasHeight}`);

            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            // Draw the base image at actual size
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
        // Set font style based on element properties
        const fontSize = element.size || 16;
        const fontFamily = 'Arial';
        const fontWeight = element.bold ? 'bold' : 'normal';
        const fontColor = element.color || '#000000';

        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // console.log('Processing element:', dynamicData);

        console.log("processElement: ", dynamicData.qr_data)

        switch (element.elementId) {
            case 1: // QR Code
                await this.drawQRCode(ctx, element, dynamicData, canvas);
                break;
            case 2: // Register No
                this.drawText(ctx, element, dynamicData.register_no + "|" + dynamicData.sticker_no || element.label);
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
            // const qrData = dynamicData.qr_data || "https://delight-herbal-house.com/info/";
            // const qrData = this.generateQRCodeData(dynamicData.qr_data);

            const qrData = `https://labelpro-dashboard.vercel.app/info?qrcode=${dynamicData.qr_data}`;

            // Generate QR code as data URL
            const qrDataUrl = await QRCode.toDataURL(qrData, {
                // width: element.size,
                width: 100,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });


            // Create image from QR code data URL
            const qrImage = await loadImage(qrDataUrl);

            // Draw QR code at specified position
            ctx.drawImage(qrImage, element.x, element.y, element.size, element.size);

        } catch (error) {
            console.error('QR code generation error:', error);
            // Fallback: draw text instead of QR code
            this.drawText(ctx, element, 'QR Code');
        }
    }

    private static generateQRCodeData(dynamicData: any): string {
        // Trim and clean the values
        const trimmedLotNo = (dynamicData.lot_no || '').trim();
        const trimmedRegisterNo = (dynamicData.register_no || '').trim();
        const trimmedStickerNo = (dynamicData.sticker_no || '').trim();

        // Create the raw string: lot_no|register_no|sticker_no1
        const qrcodeRaw = `${trimmedLotNo}|${trimmedRegisterNo}|${trimmedStickerNo}1`;

        // console.log('QR code raw data:', qrcodeRaw);

        // Base64 encode the raw string
        const qrcodeEncode = base64.encode(qrcodeRaw);

        // console.log('QR code base64 encoded:', qrcodeEncode);

        // Create the final URL
        const qrData = `https://delight-herbal-house.com/info/?qr=${qrcodeEncode}`;

        return qrData;
    }

    private static drawText(ctx: any, element: LabelElement, text: string): void {
        ctx.fillText(text, element.x, element.y);
    }


}