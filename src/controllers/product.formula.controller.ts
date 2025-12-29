import { Request, Response } from 'express';
import { ProductFormula } from '../models/product.formula.model';
import { Product } from '../models/product.model';
import { Material } from '../models/material.model';
import msg from '../constants/msg.json';
import { isValidMaterialUnit } from '../utility/util.function';
import { MaterialUnit } from '../constants/enum.data';

export const ProductFormulaController = {
    // Create a new product formula
    create: async (req: Request, res: Response) => {
        try {
            const { productId, materialId, quantity, unit } = req.body;

            // Check if product already exists
            const existingProduct = await Product.findByPk(productId);
            if (!existingProduct) {
                return res.json({
                    code: 101, message: msg["101"],
                    detail: `product_id ${productId}`
                });
            }

            const existingMaterial = await Material.findByPk(materialId);
            if (!existingMaterial) {
                return res.json({
                    code: 101, message: msg["101"],
                    detail: `material_id ${materialId}`
                });
            }

            const existingFormula = await ProductFormula.findOne({
                where: {
                    productId,
                    materialId
                }
            });

            if (existingFormula) {
                return res.json({
                    code: 107,
                    message: msg["107"],
                    detail: 'A formula with this product and material combination already exists'
                });
            }

            if (!isValidMaterialUnit(unit)) return res.json({
                code: 111,
                message: msg["111"],
                detail: `StockUnit ${unit} is not in [${Object.values(MaterialUnit)}]`
            });


            const formula = await ProductFormula.create({
                productId,
                materialId,
                quantity,
                unit
            });

            return res.json({ code: 0, message: msg["0"], data: formula.get() });
        } catch (error) {
            console.log("Error : ", error)
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all product formulas
    getAll: async (req: Request, res: Response) => {
        try {
            const formulas = await ProductFormula.findAll({
                include: [
                    { model: Product, as: 'product', attributes: ['id', 'productId', 'productNameTh'] },
                    { model: Material, as: 'material', attributes: ['id', 'materialId', 'materialNameTh'] }
                ],
                order: [['id', 'ASC']]

            });
            return res.json({ code: 0, message: msg["0"], data: formulas });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Get product formula by ID
    getById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const formula = await ProductFormula.findByPk(id, {
                include: [
                    { model: Product, as: 'product' },
                    { model: Material, as: 'material' }
                ]
            });

            if (!formula) {
                return res.json({ code: 101, message: msg["101"], detail: `product_formula_id ${id}` });
            }

            return res.json({ code: 0, message: msg["0"], data: formula });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Update product formula
    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { productId, materialId, quantity, unit } = req.body;

            console.log(req.body['unit'])

            const formula = await ProductFormula.findByPk(id);
            if (!formula) {
                return res.json({ code: 101, message: msg["101"], detail: `product_formula_id ${id}` });

            }

            const existingFormula = await ProductFormula.findOne({ where: { productId, materialId } });
            if (existingFormula && existingFormula.id != Number(id)) {
                return res.json({
                    code: 107,
                    message: msg["107"],
                    detail: 'A formula with this product and material combination already exists'
                });
            }

            if (!isValidMaterialUnit(unit)) return res.json({
                code: 111,
                message: msg["111"],
                detail: `StockUnit ${unit} is not in [${Object.values(MaterialUnit)}]`
            });

            // Only update fields that are provided
            // if (productId !== undefined) formula.productId = productId;
            // if (materialId !== undefined) formula.materialId = materialId;
            // if (quantity !== undefined) formula.quantity = quantity;
            // if (unit !== undefined) formula.unit = unit;
            // // await formula.save();

            await formula.update(req.body);
            return res.json({ code: 0, message: msg["0"], data: formula });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    },

    // Delete product formula
    delete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const formula = await ProductFormula.findByPk(id);

            if (!formula) {
                return res.json({ code: 101, message: msg["101"], detail: `product_formula_id ${id}` });
            }

            await formula.destroy();
            return res.json({ code: 0, message: msg["0"] });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }


}