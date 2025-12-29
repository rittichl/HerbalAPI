import { Request, Response } from 'express';
import MenuPermission from '../models/menu.permission.model';
import MenuItem from '../models/menu.item.model';
import UserGroup from '../models/user_group.model';
import msg from '../constants/msg.json';

export const menuPermissionController = {
    // Create a new menu permission
    createMenuPermission: async (req: Request, res: Response) => {
        try {
            const { menu_item_id, user_group_id, view, add, edit, delete: deletePermission } = req.body;

            // Verify menu item exists
            const menuItem = await MenuItem.findByPk(menu_item_id);
            if (!menuItem) {
                return res.json({ 
                    code: 101, 
                    message: msg["101"], 
                    detail: `menu_item_id ${menu_item_id}` 
                });
            }

            // Verify user group exists
            const userGroup = await UserGroup.findByPk(user_group_id);
            if (!userGroup) {
                return res.json({ 
                    code: 101, 
                    message: msg["101"], 
                    detail: `user_group_id ${user_group_id}` 
                });
            }

            // Check if permission already exists
            const existingPermission = await MenuPermission.findOne({
                where: { menu_item_id, user_group_id }
            });

            if (existingPermission) {
                return res.json({ 
                    code: 107, 
                    message: msg["107"], 
                    detail: 'Permission already exists for this menu item and user group' 
                });
            }

            // Create new menu permission
            const menuPermission = await MenuPermission.create({
                menu_item_id,
                user_group_id,
                view: view || false,
                add: add || false,
                edit: edit || false,
                delete: deletePermission || false
            });

            // Fetch with relations
            const permissionWithRelations = await MenuPermission.findByPk(menuPermission.id, {
                include: [
                    {
                        model: MenuItem,
                        as: 'menuItem',
                        attributes: ['id', 'menu_name', 'resource_name']
                    },
                    {
                        model: UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'group_code', 'group_name']
                    }
                ]
            });

            return res.json({ code: 0, message: msg["0"], data: permissionWithRelations });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get all menu permissions
    getAllMenuPermissions: async (req: Request, res: Response) => {
        try {
            const menuPermissions = await MenuPermission.findAll({
                attributes: ['id', 'menu_item_id', 'user_group_id', 'view', 'add', 'edit', 'delete', 'created_at', 'updated_at'],
                include: [
                    {
                        model: MenuItem,
                        as: 'menuItem',
                        attributes: ['id', 'menu_name', 'resource_name']
                    },
                    {
                        model: UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'group_code', 'group_name']
                    }
                ],
                order: [['id', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: menuPermissions });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get permissions by user group
    getPermissionsByUserGroup: async (req: Request, res: Response) => {
        try {
            const { user_group_id } = req.params;

            const menuPermissions = await MenuPermission.findAll({
                where: { user_group_id },
                attributes: ['id', 'menu_item_id', 'user_group_id', 'view', 'add', 'edit', 'delete', 'created_at', 'updated_at'],
                include: [
                    {
                        model: MenuItem,
                        as: 'menuItem',
                        attributes: ['id', 'menu_name', 'resource_name']
                    },
                    {
                        model: UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'group_code', 'group_name']
                    }
                ],
                order: [['id', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: menuPermissions });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get permissions by menu item
    getPermissionsByMenuItem: async (req: Request, res: Response) => {
        try {
            const { menu_item_id } = req.params;

            const menuPermissions = await MenuPermission.findAll({
                where: { menu_item_id },
                attributes: ['id', 'menu_item_id', 'user_group_id', 'view', 'add', 'edit', 'delete', 'created_at', 'updated_at'],
                include: [
                    {
                        model: MenuItem,
                        as: 'menuItem',
                        attributes: ['id', 'menu_name', 'resource_name']
                    },
                    {
                        model: UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'group_code', 'group_name']
                    }
                ],
                order: [['id', 'ASC']]
            });

            return res.json({ code: 0, message: msg["0"], data: menuPermissions });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Get single menu permission by ID
    getMenuPermissionById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const menuPermission = await MenuPermission.findByPk(id, {
                attributes: ['id', 'menu_item_id', 'user_group_id', 'view', 'add', 'edit', 'delete', 'created_at', 'updated_at'],
                include: [
                    {
                        model: MenuItem,
                        as: 'menuItem',
                        attributes: ['id', 'menu_name', 'resource_name']
                    },
                    {
                        model: UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'group_code', 'group_name']
                    }
                ]
            });

            if (!menuPermission) {
                return res.json({ code: 101, message: msg["101"] });
            }

            return res.json({ code: 0, message: msg["0"], data: menuPermission });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Update menu permission
    updateMenuPermission: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { view, add, edit, delete: deletePermission } = req.body;

            const menuPermission = await MenuPermission.findByPk(id);
            if (!menuPermission) {
                return res.json({ code: 101, message: msg["101"] });
            }

            await menuPermission.update({
                view: view !== undefined ? view : menuPermission.view,
                add: add !== undefined ? add : menuPermission.add,
                edit: edit !== undefined ? edit : menuPermission.edit,
                delete: deletePermission !== undefined ? deletePermission : menuPermission.delete
            });

            // Fetch updated permission with relations
            const updatedPermission = await MenuPermission.findByPk(id, {
                include: [
                    {
                        model: MenuItem,
                        as: 'menuItem',
                        attributes: ['id', 'menu_name', 'resource_name']
                    },
                    {
                        model: UserGroup,
                        as: 'userGroup',
                        attributes: ['id', 'group_code', 'group_name']
                    }
                ]
            });

            return res.json({ code: 0, message: msg["0"], data: updatedPermission });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    },

    // Delete menu permission
    deleteMenuPermission: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const menuPermission = await MenuPermission.findByPk(id);
            if (!menuPermission) {
                return res.json({ code: 101, message: msg["101"] });
            }

            await menuPermission.destroy();
            return res.json({ code: 0, message: msg["0"], data: { id: parseInt(id) } });
        } catch (error) {
            return res.status(500).json({ code: 500, message: msg["500"], detail: `${error}` });
        }
    }
};

export default menuPermissionController;

