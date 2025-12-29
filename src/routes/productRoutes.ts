import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { ProductFormulaController } from '../controllers/product.formula.controller';
import { auth, isAdmin } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Product
router.post('/products', auth, isAdmin, validatePostData(['productId', 'productNameEn', 'productNameTh', 'quantity', 'productUnit']), productController.createProduct);
router.get('/products', auth, productController.getAllProducts);
router.get('/products/:id', auth, productController.getProductById);
router.patch('/products/:id', auth, isAdmin, validatePostData(['productId', 'productNameEn', 'productNameTh', 'quantity', 'productUnit']), productController.updateProduct);
router.delete('/products/:id', auth, isAdmin, productController.deleteProduct);

// Product Formula
router.post('/product-formulas', auth, isAdmin, validatePostData(['productId', 'materialId', 'quantity', 'unit']), ProductFormulaController.create);
router.get('/product-formulas', auth, ProductFormulaController.getAll);
router.get('/product-formulas/:id', auth, ProductFormulaController.getById);
router.patch('/product-formulas/:id', auth, isAdmin, validatePostData(['productId', 'materialId', 'quantity', 'unit']), ProductFormulaController.update);
router.delete('/product-formulas/:id', auth, isAdmin, ProductFormulaController.delete);

export default router;

