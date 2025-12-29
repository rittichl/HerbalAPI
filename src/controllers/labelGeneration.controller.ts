// import { Request, Response } from 'express';
// import { EnhancedImageGenerator } from '../utility/enhancedImageGenerator';
// import msg from '../constants/msg.json';
// import path from 'path';
// import fs from 'fs';
// import base64 from 'base-64';
// import { MisLabelTemplate } from '../models/labelTemplate.model';
// import { MisLabelElement } from '../models/labelElement.model';

// export const labelGenerationController = {
//     // Generate label image from template with dynamic data
//     generateLabelImage: async (req: Request, res: Response) => {
//         try {
//             const { templateId } = req.params;
//             const {
//                 register_no,
//                 lot_no,
//                 production_date,
//                 expiry_date,
//                 qr_data
//             } = req.body;



//             // Validate required parameters
//             if (!templateId) {
//                 return res.json({
//                     code: 110,
//                     message: msg["110"],
//                     detail: 'Template ID is required'
//                 });
//             }


//             const template = await MisLabelTemplate.findByPk(templateId, {
//                 include: [{
//                     model: MisLabelElement,
//                     as: 'elements',
//                     attributes: ['id', 'elementId', 'label', 'x', 'y', 'size', 'bold', 'color']
//                 }]
//             });

//             if (!template) {
//                 return res.json({
//                     code: 101,
//                     message: msg["101"],
//                     detail: 'Template not found'
//                 });
//             }

//             if (!template.imageUrl) {
//                 return res.json({
//                     code: 110,
//                     message: msg["110"],
//                     detail: 'Template has no base image'
//                 });
//             }

//             // Prepare dynamic data
//             const dynamicData = {
//                 register_no: register_no || template.registerNo,
//                 lot_no: lot_no || template.lotNo,
//                 production_date: production_date || template.productionDate.toISOString().split('T')[0],
//                 expiry_date: expiry_date || template.expiryDate.toISOString().split('T')[0],
//                 qr_data: qr_data || `https://delight-herbal-house.com/info/?qr=${register_no || template.registerNo}-${lot_no || template.lotNo}`
//             };

//             // Generate output filename
//             const outputFilename = `label-${templateId}-${Date.now()}.png`;
//             const outputPath = path.join(__dirname, '../../uploads/generated/labels', outputFilename);

//             console.log("Output path: ", outputPath);

//             // Ensure directory exists
//             const outputDir = path.dirname(outputPath);
//             if (!fs.existsSync(outputDir)) {
//                 fs.mkdirSync(outputDir, { recursive: true });
//             }

//             // Get the base image path
//             const imagePath = path.join(__dirname, '..', template.imageUrl);

//              const labelElements = elements.map((element: any) => ({
//                 labelTemplateId: labelTemplate.id,
//                 elementId: element.id,
//                 label: element.label,
//                 x: element.x,
//                 y: element.y,
//                 size: element.size || 16,
//                 bold: element.bold || false,
//                 color: element.color || '#000000'
//             }));

//             // Generate the label image
//             await EnhancedImageGenerator.generateLabelImage({
//                 imagePath: imagePath,
//                 outputPath: outputPath,
//                 elements: template.elements,
//                 dynamicData: dynamicData,
//                 // canvasWidth: template.canvasWidth,
//                 // canvasHeight: template.canvasHeight
//             });

//             const imageUrl = `/uploads/generated/labels/${outputFilename}`;

//             return res.json({
//                 code: 0,
//                 message: msg["0"],
//                 data: {
//                     imageUrl: imageUrl,
//                     downloadUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
//                     templateId: templateId,
//                     dynamicData: dynamicData,
//                     generatedAt: new Date().toISOString()
//                 }
//             });

//         } catch (error) {
//             console.error('Label generation error:', error);
//             return res.status(500).json({
//                 code: 500,
//                 message: msg["500"],
//                 detail: `${error}`
//             });
//         }
//     },

//     generateQRCodeData(dynamicData: any): string {
//         // Trim and clean the values
//         const trimmedLotNo = (dynamicData.lot_no || '').trim();
//         const trimmedRegisterNo = (dynamicData.register_no || '').trim();
//         const trimmedStickerNo = (dynamicData.sticker_no || '').trim();

//         // Create the raw string: lot_no|register_no|sticker_no1
//         const qrcodeRaw = `${trimmedLotNo}|${trimmedRegisterNo}|${trimmedStickerNo}1`;

//         console.log('QR code raw data:', qrcodeRaw);

//         // Base64 encode the raw string
//         const qrcodeEncode = base64.encode(qrcodeRaw);

//         console.log('QR code base64 encoded:', qrcodeEncode);

//         // Create the final URL
//         const qrData = `https://delight-herbal-house.com/info/?qr=${qrcodeEncode}`;

//         return qrData;
//     },

//     // Get template preview with sample data
//     generatePreview: async (req: Request, res: Response) => {
//         try {
//             const { templateId } = req.params;

//             if (!templateId) {
//                 return res.json({
//                     code: 110,
//                     message: msg["110"],
//                     detail: 'Template ID is required'
//                 });
//             }

//             // Get template from database
//             const template = await MisLabelTemplate.findByPk(templateId, {
//                 include: [{
//                     model: MisLabelElement,
//                     as: 'elements',
//                     attributes: ['id', 'elementId', 'label', 'x', 'y']
//                 }]
//             });

//             if (!template) {
//                 return res.json({
//                     code: 101,
//                     message: msg["101"],
//                     detail: 'Template not found'
//                 });
//             }

//             if (!template.imageUrl) {
//                 return res.json({
//                     code: 110,
//                     message: msg["110"],
//                     detail: 'Template has no base image'
//                 });
//             }


//             // Use template's own data for preview
//             const dynamicData = {
//                 register_no: template.registerNo,
//                 lot_no: template.lotNo,
//                 production_date: template.productionDate.toISOString().split('T')[0],
//                 expiry_date: template.expiryDate.toISOString().split('T')[0],
//                 qr_data: `https://delight-herbal-house.com/info/?qr=${template.registerNo}-${template.lotNo}`,
//                 sticker_no: template.stickerNo
//             };

//             // Generate output filename
//             const outputFilename = `preview-${templateId}-${Date.now()}.png`;
//             const outputPath = path.join(__dirname, '../../uploads/generated/previews', outputFilename);

//             console.log("Output path: ", outputPath);
//             console.log("Dir name: ", __dirname);

//             // Ensure directory exists
//             const outputDir = path.dirname(outputPath);
//             if (!fs.existsSync(outputDir)) {
//                 fs.mkdirSync(outputDir, { recursive: true });
//             }

//             // Get the base image path
//             const imagePath = path.join(__dirname, '..', template.imageUrl);

//             // Generate the preview image
//             await EnhancedImageGenerator.generateLabelImage({
//                 imagePath: imagePath,
//                 outputPath: outputPath,
//                 elements: template.elements,
//                 dynamicData: dynamicData,
//                 // canvasWidth: template.canvasWidth,
//                 // canvasHeight: template.canvasHeight
//             });

//             const imageUrl = `/uploads/generated/previews/${outputFilename}`;

//             return res.json({
//                 code: 0,
//                 message: msg["0"],
//                 data: {
//                     imageUrl: imageUrl,
//                     downloadUrl: `${req.protocol}://${req.get('host')}${imageUrl}`,
//                     templateId: templateId,
//                     dynamicData: dynamicData,
//                     isPreview: true
//                 }
//             });

//         } catch (error) {
//             console.error('Preview generation error:', error);
//             return res.status(500).json({
//                 code: 500,
//                 message: msg["500"],
//                 detail: `${error}`
//             });
//         }
//     }
// };