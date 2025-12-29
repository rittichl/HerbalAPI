import { Router } from 'express';
import menuCategoryController from '../controllers/menuCategory.controller';
import menuItemController from '../controllers/menuItem.controller';
import menuPermissionController from '../controllers/menuPermission.controller';
import { auth } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Menu Category Routes
router.post('/menu-categories', auth, validatePostData(['name']), menuCategoryController.createMenuCategory);
router.get('/menu-categories', auth, menuCategoryController.getAllMenuCategories);
router.get('/menu-categories/:id', auth, menuCategoryController.getMenuCategoryById);
router.patch('/menu-categories/:id', auth, validatePostData(['name']), menuCategoryController.updateMenuCategory);
router.delete('/menu-categories/:id', auth, menuCategoryController.deleteMenuCategory);

// Menu Item Routes
router.post('/menu-items', auth, validatePostData(['menu_name', 'category_id']), menuItemController.createMenuItem);
router.get('/menu-items', auth, menuItemController.getAllMenuItems);
router.get('/menu-items/category/:category_id', auth, menuItemController.getMenuItemsByCategory);
router.get('/menu-items/:id', auth, menuItemController.getMenuItemById);
router.patch('/menu-items/:id', auth, menuItemController.updateMenuItem);
router.delete('/menu-items/:id', auth, menuItemController.deleteMenuItem);

// Menu Permission Routes
router.post('/menu-permissions', auth, validatePostData(['menu_item_id', 'user_group_id']), menuPermissionController.createMenuPermission);
router.get('/menu-permissions', auth, menuPermissionController.getAllMenuPermissions);
router.get('/menu-permissions/user-group/:user_group_id', auth, menuPermissionController.getPermissionsByUserGroup);
router.get('/menu-permissions/menu-item/:menu_item_id', auth, menuPermissionController.getPermissionsByMenuItem);
router.get('/menu-permissions/:id', auth, menuPermissionController.getMenuPermissionById);
router.patch('/menu-permissions/:id', auth, menuPermissionController.updateMenuPermission);
router.delete('/menu-permissions/:id', auth, menuPermissionController.deleteMenuPermission);

export default router;

