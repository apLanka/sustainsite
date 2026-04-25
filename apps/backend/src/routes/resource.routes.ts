import { Router } from 'express';
import materialRouter from './material.routes';
import equipmentRouter from './equipment.routes';
import supplierRouter from './supplier.routes';
const router = Router();
router.use('/materials', materialRouter);
router.use('/equipment', equipmentRouter);
router.use('/suppliers', supplierRouter);
export default router;
