import { Request, Response } from 'express';
import Category from '../models/category.model';
import { Material } from '../models/material.model';
import msg from '../constants/msg.json';
// import { ApiResponse } from '../utils/apiResponse';

export const categoryController = {
    // Create a new category
    createCategory: async (req: Request, res: Response) => {
        try {
            const { id, name, description } = req.body;

            // Check if category already exists
            const existingCategory = await Category.findByPk(id);
            if (existingCategory) {
                return res.json({ code: 107, message: msg["107"], detail: `id ${id}` });
            }

            // Create new category
            const category = await Category.create({
                id,
                name,
                description
            });

            return res.json({ code: 0, message: msg["0"], data: category.get() });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all categories
    getAllCategories: async (req: Request, res: Response) => {
        try {
            const categories = await Category.findAll({
                attributes: ['id', 'name', 'description', 'createdAt'],
                order: [['name', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: categories });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get single category by ID
    getCategoryById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const category = await Category.findByPk(id, {
                attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
            });

            if (!category) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: category });

        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update category
    updateCategory: async (req: Request, res: Response) => {
        try {

            const { id } = req.params;
            const { name, description } = req.body;

            // if (!id) return res.json({ code: 101, message: msg["101"] });

            const category = await Category.findByPk(id);
            if (!category) {
                return res.json({ code: 101, message: msg["101"] });
            }

            await category.update({ name, description });
            return res.json({ code: 0, message: msg["0"], data: category });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Delete category
    deleteCategory: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const category = await Category.findByPk(id);
            if (!category) {
                return res.json({ code: 101, message: msg["101"] });
            }

            // Option 2: Using Sequelize count method
            const materialCount = await Material.count({ where: { categoryId: id } });
            if (materialCount > 0) {
                return res.json({
                    code: 110, message: msg["110"],
                    detail: `category has associated Material items`
                });
            } else {
                await category.destroy();
                return res.json({ code: 0, message: msg["0"] });
            }
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    }
};