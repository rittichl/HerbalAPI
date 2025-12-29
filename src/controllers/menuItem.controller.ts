import { Request, Response } from 'express';
import MenuItem from '../models/menu.item.model';
import MenuCategory from '../models/menu.category.model';
import MenuPermission from '../models/menu.permission.model';
import msg from '../constants/msg.json';

export const menuItemController = {
    // Create a new menu item
    createMenuItem: async (req: Request, res: Response) => {
        try {
            const { menu_name, resource_name, category_id } = req.body;

            // Check if menu name already exists
            const existingMenuItem = await MenuItem.findOne({
                where: { menu_name }
            });

            if (existingMenuItem) {
                return res.json({ 
                    code: 107, 
                    message: msg["107"], 
                    detail: `menu_name "${menu_name}"` 
                });
            }

            // Verify category exists
            const category = await MenuCategory.findByPk(category_id);
            if (!category) {
                return res.json({ 
                    code: 101, 
                    message: msg["101"], 
                    detail: `category_id ${category_id}` 
                });
            }

            // Create new menu item
            const menuItem = await MenuItem.create({
                menu_name,
                resource_name: resource_name || null,
                category_id
            });

            // Fetch with category relation
            const menuItemWithCategory = await MenuItem.findByPk(menuItem.id, {
                include: [{
                    model: MenuCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }]
            });

            return res.json({ code: 0, message: msg["0"], data: menuItemWithCategory });
        } catch (error: any) {
            // Handle unique constraint error from database
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.json({ 
                    code: 107, 
                    message: msg["107"], 
                    detail: `menu_name "${req.body.menu_name}"` 
                });
            }
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all menu items
    getAllMenuItems: async (req: Request, res: Response) => {
        try {
            const menuItems = await MenuItem.findAll({
                attributes: ['id', 'menu_name', 'resource_name', 'category_id', 'created_at', 'updated_at'],
                include: [{
                    model: MenuCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }],
                order: [['menu_name', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: menuItems });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get menu items by category
    getMenuItemsByCategory: async (req: Request, res: Response) => {
        try {
            const { category_id } = req.params;

            const menuItems = await MenuItem.findAll({
                where: { category_id },
                attributes: ['id', 'menu_name', 'resource_name', 'category_id', 'created_at', 'updated_at'],
                include: [{
                    model: MenuCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }],
                order: [['menu_name', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: menuItems });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get single menu item by ID
    getMenuItemById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const menuItem = await MenuItem.findByPk(id, {
                attributes: ['id', 'menu_name', 'resource_name', 'category_id', 'created_at', 'updated_at'],
                include: [{
                    model: MenuCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }]
            });

            if (!menuItem) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: menuItem });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update menu item
    updateMenuItem: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { menu_name, resource_name, category_id } = req.body;

            const menuItem = await MenuItem.findByPk(id);
            if (!menuItem) {
                return res.json({ code: 101, message: msg["101"] });
            }

            // Check if menu name is being changed and if the new name already exists
            if (menu_name && menu_name !== menuItem.menu_name) {
                const existingMenuItem = await MenuItem.findOne({
                    where: { menu_name }
                });

                if (existingMenuItem && existingMenuItem.id !== parseInt(id)) {
                    return res.json({ 
                        code: 107, 
                        message: msg["107"], 
                        detail: `menu_name "${menu_name}"` 
                    });
                }
            }

            // Verify category exists if provided
            if (category_id) {
                const category = await MenuCategory.findByPk(category_id);
                if (!category) {
                    return res.json({
                        code: 101,
                        message: msg["101"],
                        detail: `category_id ${category_id}`
                    });
                }
            }

            await menuItem.update({
                menu_name: menu_name || menuItem.menu_name,
                resource_name: resource_name !== undefined ? (resource_name || null) : menuItem.resource_name,
                category_id: category_id || menuItem.category_id
            });

            // Fetch updated item with category
            const updatedMenuItem = await MenuItem.findByPk(id, {
                include: [{
                    model: MenuCategory,
                    as: 'category',
                    attributes: ['id', 'name']
                }]
            });

            return res.json({ code: 0, message: msg["0"], data: updatedMenuItem });
        } catch (error: any) {
            // Handle unique constraint error from database
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.json({ 
                    code: 107, 
                    message: msg["107"], 
                    detail: `menu_name "${req.body.menu_name}"` 
                });
            }
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Delete menu item
    deleteMenuItem: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const menuItem = await MenuItem.findByPk(id);
            if (!menuItem) {
                return res.json({ code: 101, message: msg["101"] });
            }

            // Check if menu item has permissions
            const permissionsCount = await MenuPermission.count({
                where: { menu_item_id: id }
            });

            if (permissionsCount > 0) {
                return res.json({
                    code: 110,
                    message: msg["110"],
                    detail: 'Cannot delete menu item with existing permissions'
                });
            }

            await menuItem.destroy();
            return res.json({ code: 0, message: msg["0"], data: { id: parseInt(id) } });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    }
};

export default menuItemController;

