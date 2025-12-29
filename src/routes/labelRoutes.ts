import { Router } from 'express';
import { misLabelTemplateController } from '../controllers/misLabelTemplate.controller';
import { auth, checkApikey } from '../controllers/auth.controller';
import { upload } from '../utility/fileUpload';
import validatePostData from '../validatePostData';

const router = Router();

// Label Templates
router.post('/label-templates/create', auth, upload.single('image'), misLabelTemplateController.createLabelTemplate);
router.post('/label-templates/approve/:templateId', auth, misLabelTemplateController.approveTemplate);
router.get('/label-templates/getlabel/:templateId', auth, misLabelTemplateController.getTemplateDetail);
router.get('/label-templates/getlabel', auth, misLabelTemplateController.getAllTemplates);
router.put('/label-templates/update/:templateId', auth, misLabelTemplateController.updateLabelTemplate);

// QR Codes
router.get('/label-templates/templateid/:templateId/qr-codes', auth, misLabelTemplateController.getTemplateQRCodes);
router.get('/label-templates/templateid/:templateId/qr-stats', auth, misLabelTemplateController.getTemplateQRStats);
router.patch('/label-templates/qr-codes/update', auth, validatePostData(['template_id', 'qrcode']), misLabelTemplateController.updateQRCode);
router.get('/label-templates/qr-codes/:id', auth, misLabelTemplateController.getQRCodeDetail);
router.get('/label-templates/qr-search', checkApikey, misLabelTemplateController.getQRCodeDetailByQr);

// Composite Sheets
router.post('/label-templates/:templateId/composite', auth, misLabelTemplateController.generateCompositeSheet);
router.get('/label-templates/:templateId/capacity', auth, misLabelTemplateController.getCompositeCapacity);

export default router;

