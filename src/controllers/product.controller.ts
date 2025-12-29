import { Request, Response } from 'express';
import Category from '../models/category.model';
import msg from '../constants/msg.json';
import { Product } from '../models/product.model';
import { isValidMaterialUnit } from '../utility/util.function';
import { MaterialUnit } from '../constants/enum.data';

export const productController = {
    // Create a new product
    createProduct: async (req: Request, res: Response) => {
        try {
            const {
                productId,
                productNameEn,
                productNameTh,
                quantity,
                productUnit
            } = req.body;

            // Check if product already exists
            const existingProduct = await Product.findOne({ where: { productId } });

            if (existingProduct) {
                return res.json({ code: 107, message: msg["107"], detail: `id ${productId}` });
            }

            if (!isValidMaterialUnit(productUnit)) return res.json({
                code: 111,
                message: msg["111"],
                detail: `StockUnit ${productUnit} is not in [${Object.values(MaterialUnit)}]`
            });


            // Create new product
            const product = await Product.create({
                productId,
                productNameEn,
                productNameTh,
                quantity,
                productUnit
            });

            return res.json({ code: 0, message: msg["0"], data: product.get() });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // // Get all products
    getAllProducts: async (req: Request, res: Response) => {
        try {
            const categories = await Product.findAll({
                // attributes: ['id', 'name', 'description', 'createdAt'],
                // order: [['name', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: categories });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get single product by ID
    getProductById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const category = await Product.findByPk(id, {
                // attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
            });

            if (!category) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: category });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // // Update product
    updateProduct: async (req: Request, res: Response) => {
        try {

            const { id } = req.params;
            // const {
            //     productId,
            //     productNameEn,
            //     productNameTh,
            //     quantity,
            //     productUnit
            // } = req.body;

            const productUnit = req.body['productUnit']
            const product = await Product.findByPk(id);
            if (!product) {
                return res.json({ code: 101, message: msg["101"] });
            }

            if (!isValidMaterialUnit(productUnit)) return res.json({
                code: 111,
                message: msg["111"],
                detail: `ProductUnit ${productUnit} is not in [${Object.values(MaterialUnit)}]`
            });

            await product.update(req.body);
            return res.json({ code: 0, message: msg["0"], data: product });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Delete product
    deleteProduct: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id);
            if (!product) {
                return res.json({
                    code: 101, message: msg["101"],
                    detail: `product_id ${id}`
                });
            }

            await product.destroy();

            return res.json({ code: 0, message: msg["0"] });


        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    }
};