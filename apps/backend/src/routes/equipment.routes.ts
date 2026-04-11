import { Router } from 'express';
import {
  createEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  assignEquipment,
  scheduleMaintenanceForEquipment,
  updateEquipmentStatus,
  getAvailableEquipment,
} from '../controllers/resource.controller';
import { authenticate, requireManager, requireAdmin } from '../middleware';

const router = Router();

router.post('/', authenticate, requireManager(), createEquipment);

router.get('/', authenticate, getEquipment);

// Must be before /:id
router.get('/list/available', authenticate, getAvailableEquipment);

router.get('/:id', authenticate, getEquipmentById);

router.put('/:id', authenticate, requireManager(), updateEquipment);

router.delete('/:id', authenticate, requireAdmin(), deleteEquipment);

router.post('/:id/assign', authenticate, requireManager(), assignEquipment);

router.post('/:id/maintenance', authenticate, requireManager(), scheduleMaintenanceForEquipment);

router.put('/:id/status', authenticate, requireManager(), updateEquipmentStatus);

export default router;
