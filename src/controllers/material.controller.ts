import { Request, Response } from 'express';
import { Material } from '../models/material.model';
import { MaterialType, MaterialUnit } from '../constants/enum.data';
import Category from '../models/category.model';
import msg from '../constants/msg.json';
import { isValidMaterialType, isValidMaterialUnit } from '../utility/util.function'


export const materialController = {

    // Create new stock item
    createMaterial: async (req: Request, res: Response) => {
        try {
            const {
                materialId,
                materialNameTh,
                categoryId,
                materialType,
                stockVolume,
                stockUnit
            } = req.body;


            // Check if materialId already exists
            const existingStock = await Material.findOne({ where: { materialId } });
            if (existingStock) {
                return res.json({
                    code: 107, message: msg["107"],
                    detail: `materail_id ${materialId}`
                });

            }

            // Verify category exists if provided
            if (categoryId) {
                const category = await Category.findByPk(categoryId);
                if (!category) {
                    return res.json({
                        code: 101, message: msg["101"],
                        detail: `category_id ${categoryId}`
                    });
                }
            }

            if (!isValidMaterialType(materialType)) return res.json({
                code: 111,
                message: msg["111"],
                detail: `MaterialType ${materialType} is not in [${Object.values(MaterialType)}]`
            });


            if (!isValidMaterialUnit(stockUnit)) return res.json({
                code: 111,
                message: msg["111"],
                detail: `StockUnit ${stockUnit} is not in [${Object.values(MaterialUnit)}]`
            });

            const stockItem = await Material.create({
                materialId,
                materialNameTh,
                categoryId,
                materialType: materialType || MaterialType.UNKNOWN,
                stockVolume: stockVolume || 0,
                stockUnit: stockUnit || MaterialUnit.GRAM,
                ...req.body
            });
            return res.json({ code: 0, message: msg["0"], data: stockItem.get() });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // // Get all stock items
    getAllMaterials: async (req: Request, res: Response) => {
        try {
            const { categoryId, materialType } = req.query;

            const whereClause: any = {};
            if (categoryId) whereClause.categoryId = categoryId;
            if (materialType) whereClause.materialType = materialType;

            const stockItems = await Material.findAll({
                where: whereClause,
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                }],
                order: [['id', 'ASC']]
                // order: [['materialNameTh', 'ASC']]
            });
            return res.json({ code: 0, message: msg["0"], data: stockItems });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get single stock item
    getMaterialById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const stockItem = await Material.findByPk(id, {
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
                }]
            });

            if (!stockItem) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: stockItem });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update stock item
    updateMaterial: async (req: Request, res: Response) => {
        try {

            console.log("Call Update Stock")
            const { id } = req.params;

            console.log("id :", id)

            const stockItem = await Material.findByPk(id);
            if (!stockItem) {
                return res.json({
                    code: 101, message: msg["101"],
                    detail: `material_id ${id}`
                });
            }

            // Verify category exists if being updated
            if (req.body.categoryId) {
                const category = await Category.findByPk(req.body.categoryId);
                if (!category) {
                    return res.json({
                        code: 101,
                        message: msg["101"],
                        detail: `category_id ${req.body.categoryId}`
                    });
                }
            }

            await stockItem.update(req.body);
            return res.json({ code: 0, message: msg["0"], data: stockItem });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // // Delete stock item
    deleteMaterial: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const stockItem = await Material.findByPk(id);
            if (!stockItem) {
                return res.json({
                    code: 101, message: msg["101"],
                    detail: `material_id ${id}`
                });
            }

            await stockItem.destroy();

            return res.json({ code: 0, message: msg["0"] });


        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    }
};

// function isValidMaterialType(materialType: any) {
//     throw new Error('Function not implemented.');
// }
// function isValidStockUnit(stockUnit: any) {
//     throw new Error('Function not implemented.');
// }

