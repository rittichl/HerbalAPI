import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { auth, isAdmin } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Category
router.post('/categories', auth, isAdmin, validatePostData(['id', 'name', 'description']), categoryController.createCategory);
router.get('/categories', auth, categoryController.getAllCategories);
router.get('/categories/:id', auth, categoryController.getCategoryById);
router.patch('/categories/:id', auth, isAdmin, validatePostData(['name', 'description']), categoryController.updateCategory);
router.delete('/categories/:id', auth, isAdmin, categoryController.deleteCategory);

export default router;

