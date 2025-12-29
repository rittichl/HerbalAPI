import { Request, Response } from 'express';
import MenuCategory from '../models/menu.category.model';
import MenuItem from '../models/menu.item.model';
import msg from '../constants/msg.json';

export const menuCategoryController = {
    // Create a new menu category
    createMenuCategory: async (req: Request, res: Response) => {
        try {
            const { name, description } = req.body;

            // Check if category name already exists
            const existingCategory = await MenuCategory.findOne({
                where: { name }
            });

            if (existingCategory) {
                return res.json({ 
                    code: 107, 
                    message: msg["107"], 
                    detail: `name "${name}"` 
                });
            }

            // Create new menu category
            const menuCategory = await MenuCategory.create({
                name,
                description: description || null
            });

            return res.json({ code: 0, message: msg["0"], data: menuCategory.get() });
        } catch (error: any) {
            // Handle unique constraint error from database
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.json({ 
                    code: 107, 
                    message: msg["107"], 
                    detail: `name "${req.body.name}"` 
                });
            }
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all menu categories
    getAllMenuCategories: async (req: Request, res: Response) => {
        try {
            const menuCategories = await MenuCategory.findAll({
                attributes: ['id', 'name', 'description', 'created_at', 'updated_at'],
                order: [['name', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: menuCategories });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get single menu category by ID
    getMenuCategoryById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const menuCategory = await MenuCategory.findByPk(id, {
                attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
            });

            if (!menuCategory) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: menuCategory });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update menu category
    updateMenuCategory: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const menuCategory = await MenuCategory.findByPk(id);
            if (!menuCategory) {
                return res.json({ code: 101, message: msg["101"] });
            }

            // Check if name is being changed and if the new name already exists
            if (name && name !== menuCategory.name) {
                const existingCategory = await MenuCategory.findOne({
                    where: { name }
                });

                if (existingCategory && existingCategory.id !== parseInt(id)) {
                    return res.json({ 
                        code: 107, 
                        message: msg["107"], 
                        detail: `name "${name}"` 
                    });
                }
            }

            await menuCategory.update({
                name: name || menuCategory.name,
                description: description !== undefined ? description : menuCategory.description
            });

            return res.json({ code: 0, message: msg["0"], data: menuCategory.get() });
        } catch (error: any) {
            // Handle unique constraint error from database
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.json({ 
                    code: 107, 
                    message: msg["107"], 
                    detail: `name "${req.body.name}"` 
                });
            }
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Delete menu category
    deleteMenuCategory: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const menuCategory = await MenuCategory.findByPk(id);
            if (!menuCategory) {
                return res.json({ code: 101, message: msg["101"] });
            }

            // Check if category has menu items
            const menuItemsCount = await MenuItem.count({
                where: { category_id: id }
            });

            if (menuItemsCount > 0) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Cannot delete category with existing menu items'
                });
            }

            await menuCategory.destroy();
            return res.json({ code: 0, message: msg["0"], data: { id: parseInt(id) } });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    }
};

export default menuCategoryController;

