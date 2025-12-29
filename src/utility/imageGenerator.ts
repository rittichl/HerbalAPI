import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
import fs from 'fs';

// Register Thai fonts if needed (optional)
// registerFont(path.join(__dirname, '../fonts/THSarabun.ttf'), { family: 'TH Sarabun' });

export interface TextElement {
    id: number;
    label: string;
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    maxWidth?: number;
}

export interface GenerateImageOptions {
    imagePath: string;
    outputPath: string;
    elements: TextElement[];
    canvasWidth?: number;
    canvasHeight?: number;
}

export class ImageGenerator {
    static async generateLabelImage(options: GenerateImageOptions): Promise<string> {
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

            // Set default font styles
            ctx.font = '20px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            // Draw each text element
            for (const element of options.elements) {
                this.drawTextElement(ctx, element);
            }

            // Save the generated image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(options.outputPath, buffer);

            return options.outputPath;

        } catch (error) {
            console.error('Image generation error:', error);
            throw new Error(`Failed to generate image: ${error}`);
        }
    }

    private static drawTextElement(ctx: any, element: TextElement): void {
        // Set custom styles if provided
        if (element.fontFamily || element.fontSize) {
            const fontSize = element.fontSize || 20;
            const fontFamily = element.fontFamily || 'Arial';
            ctx.font = `${fontSize}px ${fontFamily}`;
        }

        if (element.color) {
            ctx.fillStyle = element.color;
        }

        // Handle text wrapping if maxWidth is specified
        if (element.maxWidth) {
            this.wrapText(ctx, element.label, element.x, element.y, element.maxWidth, element.fontSize || 20);
        } else {
            ctx.fillText(element.label, element.x, element.y);
        }
    }

    private static wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    //   // Alternative method using JIMP (if you prefer)
    //   static async generateWithJIMP(imagePath: string, outputPath: string, elements: TextElement[]): Promise<string> {
    //     const Jimp = await import('jimp');

    //     try {
    //       const image = await Jimp.default.read(imagePath);
    //       const font = await Jimp.default.loadFont(Jimp.default.FONT_SANS_32_BLACK);

    //       for (const element of elements) {
    //         image.print(
    //           font,
    //           element.x,
    //           element.y,
    //           {
    //             text: element.label,
    //             alignmentX: Jimp.default.HORIZONTAL_ALIGN_LEFT,
    //             alignmentY: Jimp.default.VERTICAL_ALIGN_TOP
    //           },
    //           element.maxWidth || image.bitmap.width - element.x
    //         );
    //       }

    //       await image.writeAsync(outputPath);
    //       return outputPath;

    //     } catch (error) {
    //       console.error('JIMP generation error:', error);
    //       throw new Error(`Failed to generate image with JIMP: ${error}`);
    //     }
    //   }
}