import { Router } from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import materialRoutes from './routes/materialRoutes';
import vendorRoutes from './routes/vendorRoutes';
import orderRoutes from './routes/orderRoutes';
import inspectionRoutes from './routes/inspectionRoutes';
import labelRoutes from './routes/labelRoutes';
import uploadRoutes from './routes/uploadRoutes';
import healthRoutes from './routes/healthRoutes';
import menuRoutes from './routes/menuRoutes';

export const router = Router();

// Mount all route modules
router.use(authRoutes);
router.use(userRoutes);
router.use(categoryRoutes);
router.use(productRoutes);
router.use(materialRoutes);
router.use(vendorRoutes);
router.use(orderRoutes);
router.use(inspectionRoutes);
router.use(labelRoutes);
router.use(uploadRoutes);
router.use(healthRoutes);
router.use(menuRoutes);
