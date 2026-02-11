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
} from '../controllers/document.controller';
import {
  authenticate,
  requireDataEntry,
  authorize,
  checkOwnership,
} from '../middleware';
import { UserRole } from '../types';
import Document from '../models/Document';

const router = Router();

/**
 * @route   POST /api/documents
 * @desc    Upload a new document
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR
 */
router.post('/', authenticate, requireDataEntry(), uploadDocument);

/**
 * @route   GET /api/documents
 * @desc    Get all documents (with filters)
 * @access  Authenticated users
 */
router.get('/', authenticate, getDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Authenticated users
 */
router.get('/:id', authenticate, getDocumentById);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document metadata
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR
 */
router.put('/:id', authenticate, requireDataEntry(), updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document
 * @access  Document owner or ADMIN
 */
router.delete(
  '/:id',
  authenticate,
  checkOwnership(Document, 'params.id', 'uploadedBy'),
  deleteDocument
);

/**
 * @route   PUT /api/documents/:id/approve
 * @desc    Approve a document
 * @access  ADMIN, INSPECTOR
 */
router.put(
  '/:id/approve',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  approveDocument
);

/**
 * @route   PUT /api/documents/:id/reject
 * @desc    Reject a document
 * @access  ADMIN, INSPECTOR
 */
router.put(
  '/:id/reject',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  rejectDocument
);

/**
 * @route   POST /api/documents/:id/version
 * @desc    Create a new version of a document
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR
 */
router.post('/:id/version', authenticate, requireDataEntry(), createNewVersion);

/**
 * @route   GET /api/documents/:id/download
 * @desc    Download a document
 * @access  Authenticated users
 */
router.get('/:id/download', authenticate, downloadDocument);

export default router;
