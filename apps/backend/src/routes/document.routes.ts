import { Router } from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  approveDocument,
  rejectDocument,
  createNewVersion,
  downloadDocument,
  searchDocuments,
  updateDocumentStatus,
} from '../controllers/document.controller';
import { authenticate, requireDataEntry, authorize, checkOwnership } from '../middleware';
import { UserRole } from '../types';
import Document from '../models/Document';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, requireDataEntry(), upload.single('file'), uploadDocument);

router.get('/', authenticate, getDocuments);

// T-11: Search — must be before /:id to avoid "search" being treated as an ID
router.get('/search', authenticate, searchDocuments);

router.get('/:id', authenticate, getDocumentById);

router.put('/:id', authenticate, requireDataEntry(), updateDocument);

router.delete(
  '/:id',
  authenticate,
  checkOwnership(Document, 'params.id', 'uploadedBy'),
  deleteDocument
);

router.put(
  '/:id/approve',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  approveDocument
);

router.put(
  '/:id/reject',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  rejectDocument
);

router.post('/:id/version', authenticate, requireDataEntry(), upload.single('file'), createNewVersion);

router.get('/:id/download', authenticate, downloadDocument);

// T-12: Status update with transition validation
router.put('/:id/status', authenticate, updateDocumentStatus);

export default router;
