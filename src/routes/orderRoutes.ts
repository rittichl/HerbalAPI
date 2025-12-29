import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { auth, isAdmin } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Order
router.post('/orders', auth, isAdmin, validatePostData(['vendor_id', 'payment_id', 'delivery_days', 'items', 'order_date']), orderController.createOrder);
router.patch('/orders/vendor', auth, isAdmin, validatePostData(['order_id', 'vendor_id', 'payment_id', 'delivery_days']), orderController.updateOrderVendor);
router.get('/orders', auth, orderController.getAllOrders);
router.get('/orders/:order_id', auth, orderController.getOrderById);
router.post('/orders/materials', auth, isAdmin, validatePostData(['order_id', 'material_id', 'amount', 'price', 'order_unit']), orderController.addMaterialToOrder);
router.patch('/orders/materials', auth, isAdmin, validatePostData(['order_id', 'material_id', 'amount', 'price']), orderController.updateOrderMaterial);
router.patch('/orders/item-materials', auth, isAdmin, validatePostData(['order_id', 'vendor_id', 'payment_id', 'delivery_days', 'items']), orderController.updateOrderMaterials);
router.delete('/orders/materials/', auth, isAdmin, validatePostData(['order_id', 'material_id']), orderController.removeMaterialFromOrder);
router.delete('/orders/:order_id', auth, isAdmin, orderController.deleteOrder);

export default router;

