import { Request, Response } from 'express';
// import { MisLabelTemplate } from '../models/mis_label_template.model';
// import { MisLabelElement } from '../models/mis_label_element.model';
import msg from '../constants/msg.json';
import { getImageDimensions, getImageUrl, ImageDimensions } from '../utility/fileUpload';
import { EnhancedImageGenerator } from '../utility/enhancedImageGenerator';
import fs from 'fs';
import path from 'path';
import { QRCodeGenerator } from '../utility/qrCodeGenerator';
import { MisLabelElement, MisLabelElementAttributes } from '../models/labelElement.model';
import { MisLabelTemplate } from '../models/labelTemplate.model';
import { MisQRCode } from '../models/qrcode.model';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import { CompositeImageGenerator } from '../utility/compositeImageGenerator';

export const misLabelTemplateController = {
    createLabelTemplate: async (req: Request, res: Response) => {
        const transaction = await MisLabelTemplate.sequelize!.transaction();

        try {
            // Parse JSON strings from FormData
            const form = req.body.form ? JSON.parse(req.body.form) : null;
            const elements = req.body.elements ? JSON.parse(req.body.elements) : [];

            // Validate required fields
            if (!form || !elements) {
                if (req.file) {
                    const filePath = path.join(__dirname, '../../uploads/images', req.file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Missing required fields: form or elements'
                });
            }

            let imageUrl = null;
            let imageDimensions: ImageDimensions | null = null;

            // Handle uploaded file and get dimensions
            if (req.file) {
                imageUrl = getImageUrl(req.file.filename);

                // Get image dimensions from the uploaded file
                try {
                    const filePath = path.join(__dirname, '../../uploads/images', req.file.filename);
                    imageDimensions = await getImageDimensions(filePath);
                    console.log('Uploaded image dimensions:', imageDimensions);
                } catch (error) {
                    console.error('Could not get image dimensions:', error);
                    imageDimensions = null;
                }
            }

            // Create label template with image dimensions
            const labelTemplate = await MisLabelTemplate.create({
                templateName: `${form.register_no}_${form.sticker_no}`,
                registerNo: form.register_no,
                lotNo: form.lot_no,
                companyName: form.company_name,
                branch: form.branch,
                productionDate: form.production_date,
                expiryDate: form.expiry_date,
                // productionDate: new Date(form.production_date),
                // expiryDate: new Date(form.expiry_date),
                stickerNo: form.sticker_no,
                quantity: parseInt(form.quantity) || 0,
                imageUrl,
                imageWidth: imageDimensions?.width || null,
                imageHeight: imageDimensions?.height || null,
                imageType: imageDimensions?.type || null,
                previewImageUrl: null,
                previewGeneratedAt: null,
                approve: 0 // Default to not approved
            }, { transaction });

            // Generate the standardized filename
            const standardizedFilename = `${labelTemplate.id}_${form.register_no}_${form.sticker_no}${path.extname(req.file?.originalname || '.png')}`;

            // Rename the uploaded image file
            if (req.file && req.file.filename) {
                const oldPath = path.join(__dirname, '../../uploads/images', req.file.filename);
                const newPath = path.join(__dirname, '../../uploads/images', standardizedFilename);

                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);

                    // Update the image URL in database
                    imageUrl = getImageUrl(standardizedFilename);
                    await labelTemplate.update({ imageUrl }, { transaction });
                }
            }

            // Create label elements with styling
            const labelElements = elements.map((element: any) => ({
                labelTemplateId: labelTemplate.id,
                elementId: element.id,
                label: element.label,
                x: element.x,
                y: element.y,
                size: element.size || 16,
                bold: element.bold || false,
                color: element.color || '#000000'
            }));

            await MisLabelElement.bulkCreate(labelElements, { transaction });

            // Generate preview image with same naming pattern
            const previewFilename = `${labelTemplate.id}_${form.register_no}_${form.sticker_no}.png`;
            const previewPath = path.join(__dirname, '../../uploads/generated/previews', previewFilename);

            // Ensure directory exists
            const previewDir = path.dirname(previewPath);
            if (!fs.existsSync(previewDir)) {
                fs.mkdirSync(previewDir, { recursive: true });
            }

            // Generate QR code data for preview (use first sequence number)
            // console.log("createdAt: ", labelTemplate.createdAt.getTime())
            const qrData = QRCodeGenerator.generateQRCodeData(
                labelTemplate.id,
                1,
                labelTemplate.createdAt.getTime()
            );

            const dynamicData = {
                register_no: form.register_no,
                sticker_no: form.sticker_no,
                lot_no: form.lot_no,
                production_date: form.production_date,
                expiry_date: form.expiry_date,
                qr_data: qrData
            };

            console.log('Image Path', path.join(__dirname, '../..', imageUrl!));

            // Generate preview using the renamed image
            await EnhancedImageGenerator.generateLabelImage({
                imagePath: path.join(__dirname, '../..', imageUrl!),
                outputPath: previewPath,
                elements: labelElements,
                dynamicData: dynamicData
            });

            const previewImageUrl = `/uploads/generated/previews/${previewFilename}`;

            // Update template with preview URL
            await labelTemplate.update({
                previewImageUrl,
                previewGeneratedAt: new Date()
            }, { transaction });

            await transaction.commit();

            // Get the complete template with elements
            const completeTemplate = await MisLabelTemplate.findByPk(labelTemplate.id, {
                include: [{
                    model: MisLabelElement,
                    as: 'elements',
                    attributes: ['id', 'elementId', 'label', 'x', 'y', 'size', 'bold', 'color']
                }]
            });

            if (!completeTemplate) {
                return res.status(404).json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found after creation'
                });
            }

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    ...completeTemplate.get(),
                    qrCodesGenerated: 0 // No QR codes generated during creation
                }
            });

        } catch (error: any) {
            await transaction.rollback();

            if (req.file) {
                const filePath = path.join(__dirname, '../../uploads/images', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            console.error('Create label template error:', error);

            if (error.name === 'SyntaxError') {
                return res.status(400).json({
                    code: 400,
                    message: 'Invalid JSON format in form data',
                    detail: error.message
                });
            }

            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error.message}`
            });
        }
    },

    // New API to approve template and generate QR codes
    approveTemplate: async (req: Request, res: Response) => {
        const transaction = await MisLabelTemplate.sequelize!.transaction();

        try {
            const { templateId } = req.params;

            const template = await MisLabelTemplate.findByPk(templateId);
            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            if (template.approve === 1) {
                return res.json({
                    code: 200,
                    message: 'Template already approved',
                    detail: 'This template has already been approved'
                });
            }

            // Update template to approved
            await template.update({ approve: 1 }, { transaction });

            let qrCodesGenerated = 0;

            // Generate QR codes only if quantity > 0
            if (template.quantity > 0) {
                try {
                    const generatedQRCodes = await QRCodeGenerator.generateAndSaveQRCodes(
                        template.id,
                        template.quantity,
                        `Generated for approved template ${template.id}`,
                        template.createdAt.getTime()
                    );

                    qrCodesGenerated = generatedQRCodes.length;
                    console.log(`Generated ${qrCodesGenerated} QR codes for template ${template.id}`);
                } catch (qrError) {
                    console.error('Error generating QR codes:', qrError);
                    await transaction.rollback();
                    return res.status(500).json({
                        code: 500,
                        message: 'Failed to generate QR codes',
                        detail: `${qrError}`
                    });
                }
            }

            await transaction.commit();

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    templateId: template.id,
                    templateName: template.templateName,
                    qrCodesGenerated: qrCodesGenerated,
                    approved: true
                }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Approve template error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get template details by ID
    getTemplateDetail: async (req: Request, res: Response) => {
        try {
            const { templateId } = req.params;

            const template = await MisLabelTemplate.findByPk(templateId, {
                include: [
                    {
                        model: MisLabelElement,
                        as: 'elements',
                        attributes: ['id', 'elementId', 'label', 'x', 'y', 'size', 'bold', 'color']
                    },
                    {
                        model: MisQRCode,
                        as: 'qrCodes',
                        attributes: ['id', 'no', 'qrcode', 'sell_status', 'sell_province', 'sell_region', 'latitude', 'longitude', 'createdAt'],
                        order: [['no', 'ASC']]
                    }
                ]
            });

            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            // Get QR code statistics
            const qrCodes = template.qrCodes || [];
            const qrStats = {
                total: qrCodes.length,
                sold: qrCodes.filter(qr => qr.sell_status === 1).length,
                notSold: qrCodes.filter(qr => qr.sell_status === 0).length
            };

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    template: {
                        id: template.id,
                        templateName: template.templateName,
                        registerNo: template.registerNo,
                        lotNo: template.lotNo,
                        companyName: template.companyName,
                        branch: template.branch,
                        productionDate: template.productionDate,
                        expiryDate: template.expiryDate,
                        stickerNo: template.stickerNo,
                        quantity: template.quantity,
                        imageUrl: template.imageUrl,
                        previewImageUrl: template.previewImageUrl,
                        previewGeneratedAt: template.previewGeneratedAt,
                        approve: template.approve,
                        createdAt: template.createdAt,
                        updatedAt: template.updatedAt
                    },
                    elements: template.elements,
                    // qrCodes: qrCodes,
                    qrStats: qrStats
                }
            });

        } catch (error) {
            console.error('Get template detail error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get all templates with pagination
    getAllTemplates: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: templates } = await MisLabelTemplate.findAndCountAll({
                attributes: [
                    'id', 'templateName', 'registerNo', 'lotNo', 'companyName',
                    'branch', 'productionDate', 'expiryDate', 'stickerNo',
                    'quantity', 'imageUrl', 'previewImageUrl', 'approve',
                    'createdAt', 'updatedAt'
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset,
                include: [
                    {
                        model: MisQRCode,
                        as: 'qrCodes',
                        attributes: [],
                        required: false
                    }
                ],
                group: ['MisLabelTemplate.id']
            });

            // Get QR code counts for each template
            const templatesWithStats = await Promise.all(
                templates.map(async (template) => {
                    const qrCodes = await MisQRCode.findAll({
                        where: { template_id: template.id },
                        attributes: ['sell_status']
                    });

                    return {
                        ...template.get({ plain: true }),
                        qrStats: {
                            total: qrCodes.length,
                            sold: qrCodes.filter(qr => qr.sell_status === 1).length,
                            notSold: qrCodes.filter(qr => qr.sell_status === 0).length
                        }
                    };
                })
            );

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    templates: templatesWithStats,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(count.length / limit),
                        totalItems: count.length,
                        itemsPerPage: limit
                    }
                }
            });

        } catch (error) {
            console.error('Get all templates error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get QR codes by template ID with pagination and filtering
    getTemplateQRCodes: async (req: Request, res: Response) => {
        try {
            const { templateId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const sellStatus = req.query.sell_status ? parseInt(req.query.sell_status as string) : undefined;
            const offset = (page - 1) * limit;

            // Validate template exists
            const template = await MisLabelTemplate.findByPk(templateId, {
                attributes: ['id', 'templateName', 'registerNo', 'lotNo', 'stickerNo', 'quantity', 'approve']
            });

            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            // Build where condition
            const whereCondition: any = { template_id: templateId };
            if (sellStatus !== undefined) {
                whereCondition.sell_status = sellStatus;
            }

            // Get QR codes with pagination
            const { count, rows: qrCodes } = await MisQRCode.findAndCountAll({
                where: whereCondition,
                attributes: [
                    'id', 'no', 'qrcode', 'sell_status', 'sell_province',
                    'sell_region', 'latitude', 'longitude', 'description',
                    'createdAt', 'updatedAt'
                ],
                order: [['no', 'ASC']],
                limit: limit,
                offset: offset,
                include: [
                    {
                        model: MisLabelTemplate,
                        as: 'template',
                        attributes: ['templateName', 'registerNo', 'lotNo', 'stickerNo']
                    }
                ]
            });

            // Get statistics
            const totalQRCodes = await MisQRCode.count({ where: { template_id: templateId } });
            const soldQRCodes = await MisQRCode.count({
                where: { template_id: templateId, sell_status: 1 }
            });
            const notSoldQRCodes = await MisQRCode.count({
                where: { template_id: templateId, sell_status: 0 }
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    template: {
                        id: template.id,
                        templateName: template.templateName,
                        registerNo: template.registerNo,
                        lotNo: template.lotNo,
                        stickerNo: template.stickerNo,
                        quantity: template.quantity,
                        approve: template.approve
                    },
                    qrCodes: qrCodes,
                    statistics: {
                        total: totalQRCodes,
                        sold: soldQRCodes,
                        notSold: notSoldQRCodes,
                        currentPageCount: qrCodes.length
                    },
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(count / limit),
                        totalItems: count,
                        itemsPerPage: limit,
                        hasNext: page < Math.ceil(count / limit),
                        hasPrev: page > 1
                    },
                    filters: {
                        sell_status: sellStatus
                    }
                }
            });

        } catch (error) {
            console.error('Get template QR codes error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get QR code statistics for a template
    getTemplateQRStats: async (req: Request, res: Response) => {
        try {
            const { templateId } = req.params;

            const template = await MisLabelTemplate.findByPk(templateId, {
                attributes: ['id', 'templateName', 'quantity']
            });

            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            const totalQRCodes = await MisQRCode.count({ where: { template_id: templateId } });
            const soldQRCodes = await MisQRCode.count({
                where: { template_id: templateId, sell_status: 1 }
            });
            const notSoldQRCodes = await MisQRCode.count({
                where: { template_id: templateId, sell_status: 0 }
            });

            // Get sales by province
            const salesByProvince = await MisQRCode.findAll({
                where: { template_id: templateId, sell_status: 1 },
                attributes: [
                    'sell_province',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['sell_province'],
                order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
                raw: true
            });

            // Get recent sales
            const recentSales = await MisQRCode.findAll({
                where: { template_id: templateId, sell_status: 1 },
                attributes: ['id', 'no', 'sell_province', 'sell_region', 'updatedAt'],
                order: [['updatedAt', 'DESC']],
                limit: 10
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    template: {
                        id: template.id,
                        templateName: template.templateName,
                        expectedQuantity: template.quantity,
                        actualQuantity: totalQRCodes
                    },
                    statistics: {
                        total: totalQRCodes,
                        sold: soldQRCodes,
                        notSold: notSoldQRCodes,
                        soldPercentage: totalQRCodes > 0 ? ((soldQRCodes / totalQRCodes) * 100).toFixed(2) : 0
                    },
                    salesByProvince: salesByProvince,
                    recentSales: recentSales
                }
            });

        } catch (error) {
            console.error('Get template QR stats error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get templates by approval status
    getTemplatesByStatus: async (req: Request, res: Response) => {
        try {
            const { status } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            const approveStatus = status === 'approved' ? 1 : 0;

            const { count, rows: templates } = await MisLabelTemplate.findAndCountAll({
                where: { approve: approveStatus },
                attributes: [
                    'id', 'templateName', 'registerNo', 'lotNo', 'companyName',
                    'branch', 'productionDate', 'expiryDate', 'stickerNo',
                    'quantity', 'imageUrl', 'previewImageUrl', 'approve',
                    'createdAt', 'updatedAt'
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset
            });

            // Get QR code counts for each template
            const templatesWithStats = await Promise.all(
                templates.map(async (template) => {
                    const qrCodes = await MisQRCode.findAll({
                        where: { template_id: template.id },
                        attributes: ['sell_status']
                    });

                    return {
                        ...template.get({ plain: true }),
                        qrStats: {
                            total: qrCodes.length,
                            sold: qrCodes.filter(qr => qr.sell_status === 1).length,
                            notSold: qrCodes.filter(qr => qr.sell_status === 0).length
                        }
                    };
                })
            );

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    templates: templatesWithStats,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(count / limit),
                        totalItems: count,
                        itemsPerPage: limit
                    }
                }
            });

        } catch (error) {
            console.error('Get templates by status error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Search templates
    searchTemplates: async (req: Request, res: Response) => {
        try {
            const { query } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;

            if (!query) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Search query is required'
                });
            }

            const { count, rows: templates } = await MisLabelTemplate.findAndCountAll({
                where: {
                    [Op.or]: [
                        { templateName: { [Op.iLike]: `%${query}%` } },
                        { registerNo: { [Op.iLike]: `%${query}%` } },
                        { lotNo: { [Op.iLike]: `%${query}%` } },
                        { stickerNo: { [Op.iLike]: `%${query}%` } },
                        { companyName: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                attributes: [
                    'id', 'templateName', 'registerNo', 'lotNo', 'companyName',
                    'branch', 'productionDate', 'expiryDate', 'stickerNo',
                    'quantity', 'imageUrl', 'previewImageUrl', 'approve',
                    'createdAt', 'updatedAt'
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: offset
            });

            // Get QR code counts for each template
            const templatesWithStats = await Promise.all(
                templates.map(async (template) => {
                    const qrCodes = await MisQRCode.findAll({
                        where: { template_id: template.id },
                        attributes: ['sell_status']
                    });

                    return {
                        ...template.get({ plain: true }),
                        qrStats: {
                            total: qrCodes.length,
                            sold: qrCodes.filter(qr => qr.sell_status === 1).length,
                            notSold: qrCodes.filter(qr => qr.sell_status === 0).length
                        }
                    };
                })
            );

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    templates: templatesWithStats,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(count / limit),
                        totalItems: count,
                        itemsPerPage: limit
                    }
                }
            });

        } catch (error) {
            console.error('Search templates error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    updateQRCode: async (req: Request, res: Response) => {
        const transaction = await MisQRCode.sequelize!.transaction();

        try {
            const { template_id, qrcode, sell_province, sell_region, latitude, longitude } = req.body;

            // Validate required fields
            if (!template_id || !qrcode) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Missing required fields: template_id and qrcode'
                });
            }

            // Find the QR code with matching template_id and qrcode
            const qrCode = await MisQRCode.findOne({
                where: {
                    template_id: template_id,
                    qrcode: qrcode
                },
                include: [
                    {
                        model: MisLabelTemplate,
                        as: 'template',
                        attributes: ['id', 'templateName']
                    }
                ],
                transaction
            });

            if (!qrCode) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'QR code not found for the given template_id and qrcode'
                });
            }

            // Check if QR code is already sold
            if (qrCode.sell_status === 1) {
                await transaction.rollback();
                return res.json({
                    code: 114,
                    message: msg["114"],
                    detail: 'QR code has already been sold and cannot be updated again'
                });
            }

            // Prepare update data
            const updateData: any = {
                sell_status: 1,
                updatedAt: new Date()
            };

            // Add optional fields if provided
            if (sell_province !== undefined) updateData.sell_province = sell_province;
            if (sell_region !== undefined) updateData.sell_region = sell_region;
            if (latitude !== undefined) updateData.latitude = latitude;
            if (longitude !== undefined) updateData.longitude = longitude;

            // Update the QR code
            await qrCode.update(updateData, { transaction });

            await transaction.commit();

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    qrCode: {
                        id: qrCode.id,
                        no: qrCode.no,
                        qrcode: qrCode.qrcode,
                        sell_status: qrCode.sell_status,
                        sell_province: qrCode.sell_province,
                        sell_region: qrCode.sell_region,
                        latitude: qrCode.latitude,
                        longitude: qrCode.longitude,
                        template_id: qrCode.template_id,
                        updatedAt: qrCode.updatedAt
                    },
                    template: qrCode.template ? {
                        id: qrCode.template.id,
                        templateName: qrCode.template.templateName
                    } : null,
                    message: 'QR code successfully updated to sold status'
                }
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Update QR code error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Get QR code details by ID
    getQRCodeDetail: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Validate ID is a number
            const qrCodeId = parseInt(id);
            if (isNaN(qrCodeId)) {
                return res.json({
                    code: 104,
                    message: 'Invalid QR code ID',
                    detail: 'QR code ID must be a valid number'
                });
            }

            const qrCode = await MisQRCode.findByPk(qrCodeId, {
                include: [
                    {
                        model: MisLabelTemplate,
                        as: 'template',
                        attributes: [
                            'id', 'templateName', 'registerNo', 'lotNo', 'stickerNo',
                            'companyName', 'branch', 'productionDate', 'expiryDate',
                            'quantity', 'imageUrl', 'previewImageUrl', 'approve'
                        ]
                    }
                ]
            });

            if (!qrCode) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'QR code not found'
                });
            }

            // Convert to plain object for better response handling
            const plainQRCode = qrCode.get({ plain: true });

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    qrCode: {
                        id: plainQRCode.id,
                        template_id: plainQRCode.template_id,
                        no: plainQRCode.no,
                        qrcode: plainQRCode.qrcode,
                        sell_status: plainQRCode.sell_status,
                        sell_province: plainQRCode.sell_province,
                        sell_region: plainQRCode.sell_region,
                        latitude: plainQRCode.latitude,
                        longitude: plainQRCode.longitude,
                        description: plainQRCode.description,
                        createdAt: plainQRCode.createdAt,
                        updatedAt: plainQRCode.updatedAt
                    },
                    template: plainQRCode.template ? {
                        id: plainQRCode.template.id,
                        templateName: plainQRCode.template.templateName,
                        registerNo: plainQRCode.template.registerNo,
                        lotNo: plainQRCode.template.lotNo,
                        stickerNo: plainQRCode.template.stickerNo,
                        companyName: plainQRCode.template.companyName,
                        branch: plainQRCode.template.branch,
                        productionDate: plainQRCode.template.productionDate,
                        expiryDate: plainQRCode.template.expiryDate,
                        quantity: plainQRCode.template.quantity,
                        imageUrl: plainQRCode.template.imageUrl,
                        previewImageUrl: plainQRCode.template.previewImageUrl,
                        approve: plainQRCode.template.approve
                    } : null,
                    statusText: plainQRCode.sell_status === 1 ? 'Sold' : 'Not Sold',
                    isSold: plainQRCode.sell_status === 1
                }
            });

        } catch (error) {
            console.error('Get QR code detail error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    getQRCodeDetailByQr: async (req: Request, res: Response) => {
        try {
            // const { id } = req.params;
            const { qrcode } = req.query;

            console.log('Fetching QR code details for:', qrcode);

            if (!qrcode || typeof qrcode !== 'string') {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Missing or invalid qrcode parameter'
                });
            }


            const qrCodeResp = await MisQRCode.findOne({
                where: {
                    qrcode: qrcode
                },
                include: [
                    {
                        model: MisLabelTemplate,
                        as: 'template',
                        attributes: [
                            'id', 'templateName', 'registerNo', 'lotNo', 'stickerNo',
                            'companyName', 'branch', 'productionDate', 'expiryDate',
                            'quantity', 'imageUrl', 'previewImageUrl', 'approve'
                        ]
                    }
                ]
            });


            if (!qrCodeResp) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'QR code not found'
                });
            }

            // Convert to plain object for better response handling
            const plainQRCode = qrCodeResp.get({ plain: true });

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    qrCode: {
                        id: plainQRCode.id,
                        template_id: plainQRCode.template_id,
                        no: plainQRCode.no,
                        qrcode: plainQRCode.qrcode,
                        sell_status: plainQRCode.sell_status,
                        sell_province: plainQRCode.sell_province,
                        sell_region: plainQRCode.sell_region,
                        latitude: plainQRCode.latitude,
                        longitude: plainQRCode.longitude,
                        description: plainQRCode.description,
                        createdAt: plainQRCode.createdAt,
                        updatedAt: plainQRCode.updatedAt
                    },
                    template: plainQRCode.template ? {
                        id: plainQRCode.template.id,
                        templateName: plainQRCode.template.templateName,
                        registerNo: plainQRCode.template.registerNo,
                        lotNo: plainQRCode.template.lotNo,
                        stickerNo: plainQRCode.template.stickerNo,
                        companyName: plainQRCode.template.companyName,
                        branch: plainQRCode.template.branch,
                        productionDate: plainQRCode.template.productionDate,
                        expiryDate: plainQRCode.template.expiryDate,
                        quantity: plainQRCode.template.quantity,
                        imageUrl: plainQRCode.template.imageUrl,
                        previewImageUrl: plainQRCode.template.previewImageUrl,
                        approve: plainQRCode.template.approve
                    } : null,
                    statusText: plainQRCode.sell_status === 1 ? 'Sold' : 'Not Sold',
                    isSold: plainQRCode.sell_status === 1
                }
            });

        } catch (error) {
            console.error('Get QR code detail error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Search QR codes by various criteria
    searchQRCodes: async (req: Request, res: Response) => {
        try {
            const {
                qrcode,
                template_id,
                sell_status,
                sell_province,
                no,
                page = 1,
                limit = 20
            } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const offset = (pageNum - 1) * limitNum;

            // Build where condition
            const whereCondition: any = {};

            if (qrcode) whereCondition.qrcode = { [Op.iLike]: `%${qrcode}%` };
            if (template_id) whereCondition.template_id = parseInt(template_id as string);
            if (sell_status !== undefined) whereCondition.sell_status = parseInt(sell_status as string);
            if (sell_province) whereCondition.sell_province = { [Op.iLike]: `%${sell_province}%` };
            if (no) whereCondition.no = parseInt(no as string);

            const { count, rows: qrCodes } = await MisQRCode.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: MisLabelTemplate,
                        as: 'template',
                        attributes: ['id', 'templateName', 'registerNo', 'lotNo', 'stickerNo']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: limitNum,
                offset: offset
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    qrCodes: qrCodes.map(qr => qr.get({ plain: true })),
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(count / limitNum),
                        totalItems: count,
                        itemsPerPage: limitNum,
                        hasNext: pageNum < Math.ceil(count / limitNum),
                        hasPrev: pageNum > 1
                    },
                    filters: {
                        qrcode,
                        template_id,
                        sell_status,
                        sell_province,
                        no
                    }
                }
            });

        } catch (error) {
            console.error('Search QR codes error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Update label template (only if not approved) and regenerate preview
    updateLabelTemplate: async (req: Request, res: Response) => {
        const transaction = await MisLabelTemplate.sequelize!.transaction();

        try {
            const { templateId } = req.params;

            // Parse JSON data from request body
            const {
                register_no,
                lot_no,
                company_name,
                branch,
                production_date,
                expiry_date,
                sticker_no,
                quantity,
                elements
            } = req.body;

            // Find the template
            const template = await MisLabelTemplate.findByPk(templateId, {
                include: [{
                    model: MisLabelElement,
                    as: 'elements',
                    attributes: ['id', 'elementId', 'label', 'x', 'y', 'size', 'bold', 'color']
                }],
                transaction
            });

            if (!template) {
                await transaction.rollback();
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            // Check if template is already approved
            if (template.approve === 1) {
                await transaction.rollback();
                return res.json({
                    code: 115,
                    message: msg["115"],
                    detail: 'Cannot update template that has already been approved'
                });
            }

            // Prepare update data
            const updateData: any = {};

            if (register_no !== undefined) updateData.registerNo = register_no;
            if (lot_no !== undefined) updateData.lotNo = lot_no;
            if (company_name !== undefined) updateData.companyName = company_name;
            if (branch !== undefined) updateData.branch = branch;
            if (production_date !== undefined) updateData.productionDate = production_date;
            if (expiry_date !== undefined) updateData.expiryDate = expiry_date;
            if (sticker_no !== undefined) updateData.stickerNo = sticker_no;
            if (quantity !== undefined) updateData.quantity = parseInt(quantity) || 0;

            // Update template name if register_no or sticker_no changed
            if (register_no !== undefined || sticker_no !== undefined) {
                const newRegisterNo = register_no !== undefined ? register_no : template.registerNo;
                const newStickerNo = sticker_no !== undefined ? sticker_no : template.stickerNo;
                updateData.templateName = `${newRegisterNo}_${newStickerNo}`;
            }

            // Update template data
            if (Object.keys(updateData).length > 0) {
                await template.update(updateData, { transaction });
            }

            // Update elements if provided
            if (elements && Array.isArray(elements)) {
                try {
                    // First, remove existing elements
                    await MisLabelElement.destroy({
                        where: { labelTemplateId: templateId },
                        transaction
                    });

                    // Validate and prepare new elements
                    const validElements: any[] = [];
                    const invalidElements = [];

                    for (const element of elements) {
                        try {
                            // Validate required fields
                            if (!element || typeof element !== 'object') {
                                invalidElements.push({ element, reason: 'Invalid object' });
                                continue;
                            }

                            const elementId = element.id || element.elementId;
                            if (!elementId) {
                                invalidElements.push({ element, reason: 'Missing elementId' });
                                continue;
                            }

                            if (element.label === undefined) {
                                invalidElements.push({ element, reason: 'Missing label' });
                                continue;
                            }

                            if (element.x === undefined || element.y === undefined) {
                                invalidElements.push({ element, reason: 'Missing coordinates' });
                                continue;
                            }

                            validElements.push({
                                labelTemplateId: template.id,
                                elementId: elementId,
                                label: String(element.label),
                                x: parseFloat(element.x) || 0,
                                y: parseFloat(element.y) || 0,
                                size: parseInt(element.size) || 16,
                                bold: Boolean(element.bold),
                                color: element.color || '#000000'
                            });

                        } catch (elementError) {
                            invalidElements.push({ element, reason: `Processing error: ${elementError}` });
                        }
                    }

                    // Only create elements if there are valid ones
                    if (validElements.length > 0) {
                        try {
                            await MisLabelElement.bulkCreate(validElements, {
                                transaction,
                                validate: true,
                                returning: true, // Return the created records
                                ignoreDuplicates: false
                            });
                            console.log(`Created ${validElements.length} valid elements for template ${templateId}`);
                        } catch (bulkCreateError: any) {
                            console.error('Bulk create error details:', {
                                error: bulkCreateError.message,
                                errors: bulkCreateError.errors,
                                validElements: validElements
                            });

                            // Log each validation error
                            if (bulkCreateError.errors && Array.isArray(bulkCreateError.errors)) {
                                bulkCreateError.errors.forEach((err: any, index: number) => {
                                    console.error(`Element ${index + 1} error:`, {
                                        element: validElements[index],
                                        error: err.message,
                                        field: err.path,
                                        value: err.value
                                    });
                                });
                            }

                            throw new Error(`Failed to create elements: ${bulkCreateError.message}`);
                        }
                    }

                    if (invalidElements.length > 0) {
                        console.warn(`${invalidElements.length} invalid elements skipped:`, invalidElements);
                    }

                } catch (elementsError) {
                    console.error('Error processing elements:', elementsError);
                    // Continue with the update even if elements fail
                }
            }

            // Regenerate preview image
            try {
                const previewFilename = `${template.id}_${template.registerNo}_${template.stickerNo}.png`;
                const previewPath = path.join(__dirname, '../../uploads/generated/previews', previewFilename);

                // Ensure directory exists
                const previewDir = path.dirname(previewPath);
                if (!fs.existsSync(previewDir)) {
                    fs.mkdirSync(previewDir, { recursive: true });
                }

                // Get updated elements
                const updatedElements = await MisLabelElement.findAll({
                    where: { labelTemplateId: templateId },
                    attributes: ['id', 'elementId', 'label', 'x', 'y', 'size', 'bold', 'color'],
                    transaction
                });

                // Generate QR code data for preview
                const qrData = QRCodeGenerator.generateQRCodeData(template.id, 1, template.createdAt.getTime());

                const dynamicData = {
                    register_no: template.registerNo,
                    sticker_no: template.stickerNo,
                    lot_no: template.lotNo,
                    production_date: template.productionDate ? String(template.productionDate) : '',
                    expiry_date: template.expiryDate ? String(template.expiryDate) : '',
                    qr_data: qrData
                };

                // Generate new preview
                await EnhancedImageGenerator.generateLabelImage({
                    imagePath: path.join(__dirname, '../..', template.imageUrl!),
                    outputPath: previewPath,
                    elements: updatedElements.map(el => {
                        const plain = el.get({ plain: true });
                        return {
                            ...plain,
                            elementId: Number(plain.elementId)
                        };
                    }),
                    dynamicData: dynamicData
                });

                const previewImageUrl = `/uploads/generated/previews/${previewFilename}`;

                // Update preview URL
                await template.update({
                    previewImageUrl,
                    previewGeneratedAt: new Date()
                }, { transaction });

            } catch (previewError) {
                console.error('Error regenerating preview:', previewError);
                // Don't fail the entire update if preview generation fails
            }

            await transaction.commit();

            // Get the complete updated template
            const updatedTemplate = await MisLabelTemplate.findByPk(templateId, {
                include: [{
                    model: MisLabelElement,
                    as: 'elements',
                    attributes: ['id', 'elementId', 'label', 'x', 'y', 'size', 'bold', 'color']
                }]
            });

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    template: updatedTemplate,
                    previewRegenerated: true,
                    message: 'Template updated successfully and preview regenerated'
                }
            });

        } catch (error: any) {
            await transaction.rollback();
            console.error('Update label template error:', error);

            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    code: 400,
                    message: 'Validation error',
                    detail: error.errors.map((e: any) => e.message).join(', ')
                });
            }

            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error.message}`
            });
        }
    },

    // Get template elements for editing
    getTemplateForEdit: async (req: Request, res: Response) => {
        try {
            const { templateId } = req.params;

            const template = await MisLabelTemplate.findByPk(templateId, {
                include: [{
                    model: MisLabelElement,
                    as: 'elements',
                    attributes: ['id', 'elementId', 'label', 'x', 'y', 'size', 'bold', 'color']
                }]
            });

            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            // Check if template is approved
            if (template.approve === 1) {
                return res.json({
                    code: 105,
                    message: 'Template already approved',
                    detail: 'Template cannot be edited after approval'
                });
            }

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    template: {
                        id: template.id,
                        templateName: template.templateName,
                        registerNo: template.registerNo,
                        lotNo: template.lotNo,
                        companyName: template.companyName,
                        branch: template.branch,
                        productionDate: template.productionDate,
                        expiryDate: template.expiryDate,
                        stickerNo: template.stickerNo,
                        quantity: template.quantity,
                        imageUrl: template.imageUrl,
                        previewImageUrl: template.previewImageUrl,
                        approve: template.approve,
                        createdAt: template.createdAt,
                        updatedAt: template.updatedAt
                    },
                    elements: template.elements,
                    canEdit: template.approve === 0
                }
            });

        } catch (error) {
            console.error('Get template for edit error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    generateCompositeSheet: async (req: Request, res: Response) => {
        try {
            const { templateId } = req.params;
            const { width = 1900, height = 5000, padding = 10 } = req.body;

            const template = await MisLabelTemplate.findByPk(templateId);
            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            if (!template.previewImageUrl) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'No preview image available for this template'
                });
            }

            const previewPath = path.join(__dirname, '../..', template.previewImageUrl);

            if (!fs.existsSync(previewPath)) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Preview image file not found'
                });
            }

            const compositeFilename = `composite_${template.id}_${template.registerNo}_${template.stickerNo}.png`;
            const compositePath = path.join(__dirname, '../../uploads/generated/composites', compositeFilename);

            const result = await CompositeImageGenerator.createCompositeSheet(
                previewPath,
                compositePath,
                width,
                height,
                padding
            );

            if (result.success) {
                const compositeImageUrl = `/uploads/generated/composites/${compositeFilename}`;

                // Update template with composite info
                await template.update({
                    compositeImageUrl,
                    // compositeGeneratedAt: new Date(),
                    // labelsPerSheet: result.imagesPlaced,
                    // compositePadding: padding
                });

                return res.json({
                    code: 0,
                    message: msg["0"],
                    data: {
                        templateId: template.id,
                        compositeUrl: compositeImageUrl,
                        imagesPlaced: result.imagesPlaced,
                        padding: padding,
                        dimensions: result.dimensions,
                        downloadUrl: `${req.protocol}://${req.get('host')}${compositeImageUrl}`
                    }
                });
            } else {
                return res.json({
                    code: 500,
                    message: 'Failed to generate composite',
                    detail: result.message
                });
            }

        } catch (error) {
            console.error('Generate composite error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    },

    // Update getCompositeCapacity method to include padding:
    getCompositeCapacity: async (req: Request, res: Response) => {
        try {
            const { templateId } = req.params;
            const { width = 1900, height = 5000, padding = 10 } = req.query;

            const template = await MisLabelTemplate.findByPk(templateId);
            if (!template) {
                return res.json({
                    code: 101,
                    message: msg["101"],
                    detail: 'Template not found'
                });
            }

            // Get image dimensions from database or calculate from preview
            const labelWidth = template.imageWidth || 500;
            const labelHeight = template.imageHeight || 300;

            const capacity = CompositeImageGenerator.calculateLabelCapacity(
                labelWidth,
                labelHeight,
                Number(width),
                Number(height),
                Number(padding)
            );

            return res.json({
                code: 0,
                message: msg["0"],
                data: {
                    templateId: template.id,
                    labelDimensions: { width: labelWidth, height: labelHeight },
                    sheetDimensions: { width: Number(width), height: Number(height) },
                    padding: Number(padding),
                    capacity
                }
            });

        } catch (error) {
            console.error('Get composite capacity error:', error);
            return res.status(500).json({
                code: 500,
                message: msg["500"],
                detail: `${error}`
            });
        }
    }




    // Other existing methods (getPreview, getTemplateQRCodes, etc.) need to be updated
    // to use MisLabelTemplate and MisLabelElement instead of the old models
};