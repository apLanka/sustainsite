import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import DocumentModel, { DocumentStatus, DocumentType } from '../../models/Document';
import Project from '../../models/Project';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';

// Mock Cloudinary to avoid real uploads during tests
jest.mock('../../config/cloudinary', () => ({
  default: {},
  uploadToCloudinary: jest.fn().mockResolvedValue({
    url: 'https://res.cloudinary.com/test/image/upload/test-doc.pdf',
    cloudinaryId: 'test/construction-docs/test-doc',
    format: 'pdf',
    size: 12345,
  }),
  deleteFromCloudinary: jest.fn().mockResolvedValue(undefined),
}));

describe('Document Management API', () => {
  let adminToken: string;
  let pmToken: string;
  let inspectorToken: string;
  let viewerToken: string;
  let adminId: string;
  let pmId: string;
  let inspectorId: string;
  let projectId: string;

  beforeEach(async () => {
    const admin = await createTestUser({ email: 'doc-admin@test.com', role: UserRole.ADMIN });
    const pm = await createTestUser({ email: 'doc-pm@test.com', role: UserRole.PROJECT_MANAGER });
    const inspector = await createTestUser({ email: 'doc-inspector@test.com', role: UserRole.INSPECTOR });
    const viewer = await createTestUser({ email: 'doc-viewer@test.com', role: UserRole.VIEWER });

    adminId = admin._id.toString();
    pmId = pm._id.toString();
    inspectorId = inspector._id.toString();

    adminToken = getAuthToken(adminId, admin.email, admin.role);
    pmToken = getAuthToken(pmId, pm.email, pm.role);
    inspectorToken = getAuthToken(inspectorId, inspector.email, inspector.role);
    viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);

    await DocumentModel.deleteMany({});
    await Project.deleteMany({});

    const proj = await Project.create({
      projectName: 'Document Test Project',
      location: { address: '123 Test Street' },
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      budget: 100000,
      projectManager: pmId,
      createdBy: adminId,
    });
    projectId = proj._id.toString();
  });

  // Shared valid document seed data
  const seedDocument = async (uploadedBy: string, overrides: Record<string, unknown> = {}) => {
    return DocumentModel.create({
      projectId: new mongoose.Types.ObjectId(),
      documentType: DocumentType.PERMIT,
      title: 'Test Permit',
      version: '1.0',
      fileUrl: 'https://res.cloudinary.com/test/image/upload/test-doc.pdf',
      cloudinaryId: 'test/construction-docs/test-doc',
      fileName: 'test-document.pdf',
      fileSize: 12345,
      fileFormat: 'pdf',
      status: DocumentStatus.DRAFT,
      uploadedBy,
      tags: [],
      ...overrides,
    });
  };

  const fakeFile = Buffer.from('%PDF-1.4 fake pdf content');

  // ─── POST /api/documents ────────────────────────────────────────────────────

  describe('POST /api/documents', () => {
    it('should upload a document successfully as PROJECT_MANAGER', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${pmToken}`)
        .field('projectId', projectId)
        .field('documentType', DocumentType.PERMIT)
        .field('title', 'Building Permit 2026')
        .field('description', 'Annual permit')
        .field('tags', JSON.stringify(['permit', '2026']))
        .attach('file', fakeFile, 'permit.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Building Permit 2026');
      expect(response.body.data.status).toBe(DocumentStatus.DRAFT);
      expect(response.body.data.uploadedBy.toString()).toBe(pmId);
    });

    it('should return 400 if no file is attached', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId, documentType: DocumentType.PERMIT, title: 'No File' })
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });

    it('should return 400 for invalid projectId format', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${pmToken}`)
        .field('projectId', 'not-valid')
        .field('documentType', DocumentType.PERMIT)
        .field('title', 'Bad ID')
        .attach('file', fakeFile, 'permit.pdf')
        .expect(400);

      expect(response.body.error).toBe('Invalid projectId format');
    });

    it('should return 403 if VIEWER tries to upload', async () => {
      await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${viewerToken}`)
        .field('projectId', projectId)
        .field('documentType', DocumentType.PERMIT)
        .field('title', 'Viewer Upload')
        .attach('file', fakeFile, 'permit.pdf')
        .expect(403);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/api/documents')
        .field('projectId', projectId)
        .attach('file', fakeFile, 'permit.pdf')
        .expect(401);
    });
  });

  // ─── GET /api/documents ─────────────────────────────────────────────────────

  describe('GET /api/documents', () => {
    beforeEach(async () => {
      await seedDocument(pmId, { projectId, title: 'Permit A', documentType: DocumentType.PERMIT });
      await seedDocument(pmId, { projectId, title: 'Blueprint B', documentType: DocumentType.BLUEPRINT, status: DocumentStatus.APPROVED });
      await seedDocument(pmId, { title: 'Other Project Doc' });
    });

    it('should return all documents for authenticated user', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination.total).toBe(3);
    });

    it('should filter by projectId', async () => {
      const response = await request(app)
        .get(`/api/documents?projectId=${projectId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`/api/documents?status=${DocumentStatus.APPROVED}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Blueprint B');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/documents?page=1&limit=2')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.pages).toBe(2);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app).get('/api/documents').expect(401);
    });
  });

  // ─── GET /api/documents/:id ─────────────────────────────────────────────────

  describe('GET /api/documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = await seedDocument(pmId, { title: 'Single Document' });
      documentId = doc._id.toString();
    });

    it('should return a document by ID with full detail', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Single Document');
      expect(response.body.data).toHaveProperty('accessLog');
      expect(response.body.data).toHaveProperty('previousVersions');
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/documents/${fakeId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/documents/not-valid')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(400);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app).get(`/api/documents/${documentId}`).expect(401);
    });
  });

  // ─── PUT /api/documents/:id ─────────────────────────────────────────────────

  describe('PUT /api/documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = await seedDocument(pmId, { title: 'Original Title' });
      documentId = doc._id.toString();
    });

    it('should update document metadata as PROJECT_MANAGER', async () => {
      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ title: 'Updated Title', description: 'New description' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('New description');
    });

    it('should return 400 if no updatable fields are provided', async () => {
      const response = await request(app)
        .put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('No updatable fields provided');
    });

    it('should return 403 if VIEWER tries to update', async () => {
      await request(app)
        .put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ title: 'Hacked' })
        .expect(403);
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .put(`/api/documents/${fakeId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  // ─── DELETE /api/documents/:id ──────────────────────────────────────────────

  describe('DELETE /api/documents/:id', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = await seedDocument(pmId);
      documentId = doc._id.toString();
    });

    it('should allow the document owner to delete', async () => {
      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Document deleted successfully');

      const deleted = await DocumentModel.findById(documentId);
      expect(deleted).toBeNull();
    });

    it('should allow ADMIN to delete any document', async () => {
      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny INSPECTOR from deleting another user\'s document', async () => {
      await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(403);
    });
  });

  // ─── PUT /api/documents/:id/approve ────────────────────────────────────────

  describe('PUT /api/documents/:id/approve', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = await seedDocument(pmId, { status: DocumentStatus.UNDER_REVIEW });
      documentId = doc._id.toString();
    });

    it('should approve a document as INSPECTOR', async () => {
      const response = await request(app)
        .put(`/api/documents/${documentId}/approve`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(DocumentStatus.APPROVED);
      expect(response.body.data.approvedBy).toBeTruthy();
      expect(response.body.data.approvalDate).toBeTruthy();
    });

    it('should return 400 if document is already approved', async () => {
      await request(app)
        .put(`/api/documents/${documentId}/approve`)
        .set('Authorization', `Bearer ${inspectorToken}`);

      const response = await request(app)
        .put(`/api/documents/${documentId}/approve`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(400);

      expect(response.body.error).toBe('Document is already approved');
    });

    it('should return 403 if PROJECT_MANAGER tries to approve', async () => {
      await request(app)
        .put(`/api/documents/${documentId}/approve`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(403);
    });
  });

  // ─── PUT /api/documents/:id/reject ─────────────────────────────────────────

  describe('PUT /api/documents/:id/reject', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = await seedDocument(pmId, { status: DocumentStatus.UNDER_REVIEW });
      documentId = doc._id.toString();
    });

    it('should reject a document with a reason as INSPECTOR', async () => {
      const response = await request(app)
        .put(`/api/documents/${documentId}/reject`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ rejectionReason: 'Missing safety signature' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(DocumentStatus.REJECTED);
      expect(response.body.data.rejectionReason).toBe('Missing safety signature');
    });

    it('should return 400 if rejection reason is missing', async () => {
      const response = await request(app)
        .put(`/api/documents/${documentId}/reject`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('A rejection reason is required');
    });

    it('should return 400 if document is already rejected', async () => {
      await request(app)
        .put(`/api/documents/${documentId}/reject`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ rejectionReason: 'First rejection' });

      const response = await request(app)
        .put(`/api/documents/${documentId}/reject`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ rejectionReason: 'Second rejection' })
        .expect(400);

      expect(response.body.error).toBe('Document is already rejected');
    });

    it('should return 403 if PROJECT_MANAGER tries to reject', async () => {
      await request(app)
        .put(`/api/documents/${documentId}/reject`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ rejectionReason: 'Unauthorized' })
        .expect(403);
    });
  });

  // ─── POST /api/documents/:id/version ───────────────────────────────────────

  describe('POST /api/documents/:id/version', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = await seedDocument(pmId, { version: '1.0', status: DocumentStatus.APPROVED });
      documentId = doc._id.toString();
    });

    it('should create a new version and archive the old one', async () => {
      const response = await request(app)
        .post(`/api/documents/${documentId}/version`)
        .set('Authorization', `Bearer ${pmToken}`)
        .attach('file', fakeFile, 'updated-permit.pdf')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.version).toBe('1.1');
      expect(response.body.data.status).toBe(DocumentStatus.DRAFT);
      expect(response.body.data.previousVersions.length).toBe(1);
      expect(response.body.data.previousVersions[0].version).toBe('1.0');
    });

    it('should return 400 if no file is attached', async () => {
      const response = await request(app)
        .post(`/api/documents/${documentId}/version`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .post(`/api/documents/${fakeId}/version`)
        .set('Authorization', `Bearer ${pmToken}`)
        .attach('file', fakeFile, 'permit.pdf')
        .expect(404);
    });

    it('should return 403 if VIEWER tries to create a version', async () => {
      await request(app)
        .post(`/api/documents/${documentId}/version`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .attach('file', fakeFile, 'permit.pdf')
        .expect(403);
    });
  });

  // ─── GET /api/documents/:id/download ───────────────────────────────────────

  describe('GET /api/documents/:id/download', () => {
    let documentId: string;

    beforeEach(async () => {
      const doc = await seedDocument(pmId);
      documentId = doc._id.toString();
    });

    it('should redirect to the Cloudinary file URL for authenticated user', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(302);

      expect(response.headers.location).toContain('cloudinary.com');
    });

    it('should return 404 for non-existent document', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/documents/${fakeId}/download`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get(`/api/documents/${documentId}/download`)
        .expect(401);
    });
  });
});
