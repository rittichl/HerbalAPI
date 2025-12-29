import { Router } from 'express';
import { vendorController } from '../controllers/vendor.controller';
import { paymentTypeController } from '../controllers/paymentType.controller';
import { auth, isAdmin } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Vendor
router.post('/vendors', auth, isAdmin, validatePostData(['vendor_name_th', 'vendor_name_en', 'mobile_number']), vendorController.createVendor);
router.get('/vendors', auth, vendorController.getAllVendors);
router.get('/vendors/:id', auth, vendorController.getVendorById);
router.patch('/vendors/:id', auth, isAdmin, validatePostData(['vendor_name_th', 'vendor_name_en', 'mobile_number', 'address', 'email', 'contact']), vendorController.updateVendor);
router.delete('/vendors/:id', auth, isAdmin, vendorController.deleteVendor);

// Payment Type
router.post('/payment-types', auth, isAdmin, validatePostData(['payment_type_th', 'payment_type_en']), paymentTypeController.createPaymentType);
router.get('/payment-types', auth, paymentTypeController.getAllPaymentTypes);
router.get('/payment-types/:id', auth, paymentTypeController.getPaymentTypeById);
router.patch('/payment-types/:id', auth, isAdmin, validatePostData(['payment_type_th', 'payment_type_en']), paymentTypeController.updatePaymentType);
router.delete('/payment-types/:id', auth, isAdmin, paymentTypeController.deletePaymentType);

export default router;

