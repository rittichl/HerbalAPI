import { Router } from 'express';
import { materialController } from '../controllers/material.controller';
import { dataTypeController } from '../controllers/datatype.controller';
import { auth, isAdmin } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Material Type (Data Types)
router.get('/material-type', auth, dataTypeController.getMaterialType);
router.get('/material-unit', auth, dataTypeController.getMaterialkUnit);
router.get('/user-role', auth, dataTypeController.getUserRole);

// Material
router.post('/materials', auth, isAdmin, validatePostData(['materialId', 'materialNameEn', 'materialNameTh', 'categoryId', 'materialType', 'stockVolume', 'stockUnit']), materialController.createMaterial);
router.get('/materials', auth, materialController.getAllMaterials);
router.get('/materials/:id', auth, materialController.getMaterialById);
router.patch('/materials/:id', auth, isAdmin, validatePostData(['materialId', 'materialNameEn', 'materialNameTh', 'categoryId', 'materialType', 'stockVolume', 'stockUnit']), materialController.updateMaterial);
router.delete('/materials/:id', auth, isAdmin, materialController.deleteMaterial);

export default router;

