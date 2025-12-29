// Try this import style
const ImageModule = require('docxtemplater-image-module-free');

export class ImageModuleConfig {
    static getImageModule() {
        const imageOpts = {
            getImage: (tagValue: string, tagName: string) => {
                console.log('Processing image:', tagName, tagValue);

                try {
                    // Handle base64 images
                    if (tagValue.startsWith('data:image/')) {
                        const base64Data = tagValue.replace(/^data:image\/\w+;base64,/, '');
                        const imageBuffer = Buffer.from(base64Data, 'base64');
                        return imageBuffer;
                    }

                    // Handle file paths
                    const fs = require('fs');
                    const path = require('path');

                    // Check absolute path
                    if (fs.existsSync(tagValue)) {
                        return fs.readFileSync(tagValue);
                    }

                    // Check relative path from uploads
                    const uploadsPath = path.join(process.cwd(), 'uploads', tagValue);
                    if (fs.existsSync(uploadsPath)) {
                        return fs.readFileSync(uploadsPath);
                    }

                    // Check relative path from current directory
                    const relativePath = path.join(process.cwd(), tagValue);
                    if (fs.existsSync(relativePath)) {
                        return fs.readFileSync(relativePath);
                    }

                    console.warn(`Image not found: ${tagValue}`);
                    return null;
                } catch (error) {
                    console.error('Error reading image:', error);
                    return null;
                }
            },

            getSize: (img: Buffer, tagValue: string, tagName: string) => {
                // Fixed sizes based on tag name
                const sizes: { [key: string]: [number, number] } = {
                    'logo': [150, 150],
                    'signature': [200, 80],
                    'productImage': [400, 300],
                    'profile': [200, 200],
                    'banner': [600, 200],
                    'default': [300, 200]
                };

                return sizes[tagName] || sizes['default'];
            }
        };

        return new ImageModule(imageOpts);
    }
}