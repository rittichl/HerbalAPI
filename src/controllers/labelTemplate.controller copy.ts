// import { Request, Response } from 'express';
// import { LabelTemplate } from '../models/labelTemplate.model';
// import { LabelElement } from '../models/labelElement.model';
// import msg from '../constants/msg.json';
// import { getImageUrl } from '../utility/fileUpload';
// import fs from 'fs';
// import path from 'path';
// import { dir } from 'console';

// export const labelTemplateController = {
//     // Create label template with image and elements
//     createLabelTemplate: async (req: Request, res: Response) => {
//         const transaction = await LabelTemplate.sequelize!.transaction();

//         try {
//             // Parse JSON strings from FormData
//             const form = req.body.form ? JSON.parse(req.body.form) : null;
//             const elements = req.body.elements ? JSON.parse(req.body.elements) : [];
//             const canvasSize = req.body.canvasSize ? JSON.parse(req.body.canvasSize) : null;
//             const templateInfo = req.body.templateInfo && req.body.templateInfo !== 'null'
//                 ? JSON.parse(req.body.templateInfo)
//                 : null;

//             console.log("dir name: ", __dirname);

//             // Validate required fields
//             if (!form || !elements || !canvasSize) {
//                 if (req.file) {
//                     // Clean up uploaded file
//                     const filePath = path.join(__dirname, '../uploads/images', req.file.filename);

//                     if (fs.existsSync(filePath)) {
//                         fs.unlinkSync(filePath);
//                     }

//                 }
//                 return res.json({
//                     code: 110,
//                     message: msg["110"],
//                     detail: 'Missing required fields: form, elements, or canvasSize'
//                 });
//             }

//             let imageUrl = null;

//             // Handle uploaded file
//             if (req.file) {
//                 imageUrl = getImageUrl(req.file.filename);
//             }

//             // Create label template
//             const labelTemplate = await LabelTemplate.create({
//                 templateName: templateInfo?.name || `Template_${Date.now()}`,
//                 registerNo: form.register_no,
//                 lotNo: form.lot_no,
//                 companyName: form.company_name,
//                 branch: form.branch,
//                 productionDate: new Date(form.production_date),
//                 expiryDate: new Date(form.expiry_date),
//                 stickerNo: form.sticker_no,
//                 quantity: parseInt(form.quantity) || 0,
//                 canvasWidth: canvasSize.width,
//                 canvasHeight: canvasSize.height,
//                 imageUrl
//             }, { transaction });

//             // Create label elements
//             const labelElements = elements.map((element: any) => ({
//                 labelTemplateId: labelTemplate.id,
//                 elementId: element.id,
//                 label: element.label,
//                 x: element.x,
//                 y: element.y
//             }));

//             await LabelElement.bulkCreate(labelElements, { transaction });

//             await transaction.commit();

//             // Get the complete template with elements
//             const completeTemplate = await LabelTemplate.findByPk(labelTemplate.id, {
//                 include: [{
//                     model: LabelElement,
//                     as: 'elements',
//                     attributes: ['id', 'elementId', 'label', 'x', 'y']
//                 }]
//             });

//             return res.json({
//                 code: 0,
//                 message: msg["0"],
//                 data: completeTemplate
//             });

//         } catch (error: any) {
//             await transaction.rollback();

//             // Clean up uploaded file on error
//             if (req.file) {
//                 const filePath = path.join(__dirname, '../uploads/images', req.file.filename);
//                 if (fs.existsSync(filePath)) {
//                     fs.unlinkSync(filePath);
//                 }
//             }

//             console.error('Create label template error:', error);

//             // Handle JSON parsing errors
//             if (error.name === 'SyntaxError') {
//                 return res.status(400).json({
//                     code: 400,
//                     message: 'Invalid JSON format in form data',
//                     detail: error.message
//                 });
//             }

//             return res.status(500).json({
//                 code: 500,
//                 message: msg["500"],
//                 detail: `${error.message}`
//             });
//         }
//     },

//     // ... keep the other methods (getAllLabelTemplates, getLabelTemplateById, deleteLabelTemplate) the same
// };