import { Router } from 'express';
import { auditStatusController } from '../controllers/auditStatus.controller';
import { quarantineListController } from '../controllers/quarantineList.controller';
import { inspectionTopicController } from '../controllers/nspectionTopic.controller';
import { materialInspectionController } from '../controllers/materialInspection.controller';
import { orderDetailInspectionResultController } from '../controllers/orderDetailInspectionResult.controller';
import { auth, isAdmin } from '../controllers/auth.controller';
import validatePostData from '../validatePostData';

const router = Router();

// Audit Status
router.post('/audit-status', auth, isAdmin, validatePostData(['status_code', 'status_name']), auditStatusController.createStatus);
router.get('/audit-status', auth, auditStatusController.getAllStatuses);
router.get('/audit-status/:id', auth, auditStatusController.getStatusById);
router.patch('/audit-status/:id', auth, isAdmin, validatePostData(['status_code', 'status_name']), auditStatusController.updateStatus);
router.delete('/audit-status/:id', auth, isAdmin, auditStatusController.deleteStatus);

// Quarantine List
router.post('/quarantines', auth, validatePostData(['order_id', 'material_id', 'amount', 'unit', 'due_date', 'admit_date', 'audit_status']), quarantineListController.createQuarantine);
router.get('/quarantines', auth, quarantineListController.getAllQuarantines);
router.get('/quarantines/:id', auth, quarantineListController.getQuarantineById);
router.patch('/quarantines/:id', auth, isAdmin, validatePostData(['order_id', 'material_id', 'amount', 'unit', 'due_date', 'admit_date', 'audit_status']), quarantineListController.updateQuarantine);
router.delete('/quarantines/:id', auth, isAdmin, quarantineListController.deleteQuarantine);

// Inspection Topic
router.post('/inspection-topics', auth, isAdmin, validatePostData(['inspect_name', 'topics', 'method', 'specification']), inspectionTopicController.createInspectionTopic);
router.get('/inspection-topics', auth, inspectionTopicController.getAllInspectionTopics);
router.get('/inspection-topics/:id', auth, inspectionTopicController.getInspectionTopicById);
router.patch('/inspection-topics/:id', auth, isAdmin, validatePostData(['inspect_name', 'topics', 'method', 'specification']), inspectionTopicController.updateInspectionTopic);
router.delete('/inspection-topics/:id', auth, isAdmin, inspectionTopicController.deleteInspectionTopic);

// Material Inspection
router.post('/material-inspections', auth, isAdmin, validatePostData(['material_id', 'inspection_topic_id']), materialInspectionController.createMaterialInspection);
router.get('/material-inspections', auth, materialInspectionController.getAllMaterialInspections);
router.get('/material-inspections/material/:materialId', auth, materialInspectionController.getMaterialInspectionsByMaterialId);
router.get('/material-inspections/topic/:inspectionTopicId', auth, materialInspectionController.getMaterialInspectionsByTopicId);
router.delete('/material-inspections', auth, isAdmin, validatePostData(['material_id', 'inspection_topic_id']), materialInspectionController.deleteMaterialInspectionByPair);

// Order Detail Inspection Result
router.patch('/order-detail-inspection-results/quarantine/:id', auth, isAdmin, validatePostData(['results']), orderDetailInspectionResultController.updateResultsForQuarantine);

export default router;

