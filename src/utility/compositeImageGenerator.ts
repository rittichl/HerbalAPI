import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

export class CompositeImageGenerator {
    /**
     * Create a composite image with multiple label images arranged in a grid with padding
     * @param inputImagePath Path to the source label image
     * @param outputPath Path to save the composite image
     * @param canvasWidth Width of the composite canvas (default: 1900)
     * @param canvasHeight Height of the composite canvas (default: 5000)
     * @param padding Padding around each image in pixels (default: 10)
     */
    static async createCompositeSheet(
        inputImagePath: string,
        outputPath: string,
        canvasWidth: number = 1900,
        canvasHeight: number = 5000,
        padding: number = 10
    ): Promise<{
        success: boolean;
        message: string;
        imagesPlaced: number;
        outputPath: string;
        dimensions: {
            sheetWidth: number;
            sheetHeight: number;
            labelWidth: number;
            labelHeight: number;
            padding: number;
        };
    }> {
        try {
            // Load the source image
            const sourceImage = await loadImage(inputImagePath);
            const sourceWidth = sourceImage.width;
            const sourceHeight = sourceImage.height;

            console.log(`Source image dimensions: ${sourceWidth}x${sourceHeight}`);
            console.log(`Padding: ${padding}px`);

            // Calculate effective dimensions with padding
            const effectiveWidth = sourceWidth + (padding * 2);
            const effectiveHeight = sourceHeight + (padding * 2);

            // Calculate how many images fit in the composite with padding
            const imagesPerRow = Math.floor(canvasWidth / effectiveWidth);
            const imagesPerColumn = Math.floor(canvasHeight / effectiveHeight);
            const maxImages = imagesPerRow * imagesPerColumn;

            console.log(`Can fit ${maxImages} images (${imagesPerRow} x ${imagesPerColumn}) with padding`);

            // Create canvas
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            // Fill background with white
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            let imagesPlaced = 0;

            // Arrange images in grid with padding
            for (let row = 0; row < imagesPerColumn; row++) {
                for (let col = 0; col < imagesPerRow; col++) {
                    const x = col * effectiveWidth + padding;
                    const y = row * effectiveHeight + padding;

                    // Check if we have space left (considering padding)
                    if (y + sourceHeight <= canvasHeight && x + sourceWidth <= canvasWidth) {
                        ctx.drawImage(sourceImage, x, y, sourceWidth, sourceHeight);
                        imagesPlaced++;

                        // Optional: Draw border around each image (uncomment if needed)
                        // ctx.strokeStyle = '#CCCCCC';
                        // ctx.lineWidth = 1;
                        // ctx.strokeRect(x - padding, y - padding, effectiveWidth, effectiveHeight);
                    }
                }
            }

            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Save the composite image
            const out = fs.createWriteStream(outputPath);
            const stream = canvas.createPNGStream();
            stream.pipe(out);

            return new Promise((resolve, reject) => {
                out.on('finish', () => {
                    resolve({
                        success: true,
                        message: `Composite image created with ${imagesPlaced} labels (${padding}px padding)`,
                        imagesPlaced,
                        outputPath,
                        dimensions: {
                            sheetWidth: canvasWidth,
                            sheetHeight: canvasHeight,
                            labelWidth: sourceWidth,
                            labelHeight: sourceHeight,
                            padding
                        }
                    });
                });

                out.on('error', (error) => {
                    reject({
                        success: false,
                        message: `Failed to save composite image: ${error.message}`,
                        imagesPlaced: 0,
                        outputPath: '',
                        dimensions: {
                            sheetWidth: canvasWidth,
                            sheetHeight: canvasHeight,
                            labelWidth: sourceWidth,
                            labelHeight: sourceHeight,
                            padding
                        }
                    });
                });
            });

        } catch (error: any) {
            return {
                success: false,
                message: `Error creating composite: ${error.message}`,
                imagesPlaced: 0,
                outputPath: '',
                dimensions: {
                    sheetWidth: canvasWidth,
                    sheetHeight: canvasHeight,
                    labelWidth: 0,
                    labelHeight: 0,
                    padding
                }
            };
        }
    }

    /**
     * Calculate how many labels can fit on a sheet with padding
     */
    static calculateLabelCapacity(
        labelWidth: number,
        labelHeight: number,
        sheetWidth: number = 1900,
        sheetHeight: number = 5000,
        padding: number = 10
    ): {
        imagesPerRow: number;
        imagesPerColumn: number;
        totalImages: number;
        efficiency: number;
        effectiveLabelWidth: number;
        effectiveLabelHeight: number;
        usedWidth: number;
        usedHeight: number;
    } {
        const effectiveWidth = labelWidth + (padding * 2);
        const effectiveHeight = labelHeight + (padding * 2);

        const imagesPerRow = Math.floor(sheetWidth / effectiveWidth);
        const imagesPerColumn = Math.floor(sheetHeight / effectiveHeight);
        const totalImages = imagesPerRow * imagesPerColumn;

        const totalArea = sheetWidth * sheetHeight;
        const usedArea = totalImages * effectiveWidth * effectiveHeight;
        const efficiency = (usedArea / totalArea) * 100;

        const usedWidth = imagesPerRow * effectiveWidth;
        const usedHeight = imagesPerColumn * effectiveHeight;

        return {
            imagesPerRow,
            imagesPerColumn,
            totalImages,
            efficiency: Math.round(efficiency * 100) / 100,
            effectiveLabelWidth: effectiveWidth,
            effectiveLabelHeight: effectiveHeight,
            usedWidth,
            usedHeight
        };
    }
}