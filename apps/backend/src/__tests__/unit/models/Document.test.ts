import DocumentModel, { IDocument, DocumentType, DocumentStatus, AccessAction } from '../../../models/Document';
import { createTestUser, createTestProject } from '../../helpers/testHelpers';

describe('Document Model', () => {
  describe('Schema Validation', () => {
    it('should create document with valid data', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      const document = await DocumentModel.create({
        projectId: project._id,
        documentType: DocumentType.BLUEPRINT,
        title: 'Building Plan v1',
        fileUrl: 'https://cloudinary.com/file.pdf',
        uploadedBy: user._id,
      });

      expect(document.title).toBe('Building Plan v1');
      expect(document.documentType).toBe(DocumentType.BLUEPRINT);
      expect(document.version).toBe('1.0');
    });

    it('should fail without projectId', async () => {
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          documentType: DocumentType.BLUEPRINT,
          title: 'Test Document',
          fileUrl: 'https://example.com/file.pdf',
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without documentType', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          title: 'Test Document',
          fileUrl: 'https://example.com/file.pdf',
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without title', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: DocumentType.BLUEPRINT,
          fileUrl: 'https://example.com/file.pdf',
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with title shorter than 3 characters', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: DocumentType.BLUEPRINT,
          title: 'AB',
          fileUrl: 'https://example.com/file.pdf',
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with title longer than 200 characters', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: DocumentType.BLUEPRINT,
          title: 'A'.repeat(201),
          fileUrl: 'https://example.com/file.pdf',
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without fileUrl', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: DocumentType.BLUEPRINT,
          title: 'Test Document',
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without uploadedBy', async () => {
      const project = await createTestProject();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: DocumentType.BLUEPRINT,
          title: 'Test Document',
          fileUrl: 'https://example.com/file.pdf',
        })
      ).rejects.toThrow();
    });

    it('should fail without fileSize below 0', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: DocumentType.BLUEPRINT,
          title: 'Test Document',
          fileUrl: 'https://example.com/file.pdf',
          fileSize: -1,
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid documentType', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: 'INVALID' as DocumentType,
          title: 'Test Document',
          fileUrl: 'https://example.com/file.pdf',
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        DocumentModel.create({
          projectId: project._id,
          documentType: DocumentType.BLUEPRINT,
          title: 'Test Document',
          fileUrl: 'https://example.com/file.pdf',
          status: 'INVALID' as DocumentStatus,
          uploadedBy: user._id,
        })
      ).rejects.toThrow();
    });
  });

  describe('Document Types', () => {
    it('should accept BLUEPRINT type', async () => {
      const document = await createTestDocument({ documentType: DocumentType.BLUEPRINT });
      expect(document.documentType).toBe(DocumentType.BLUEPRINT);
    });

    it('should accept PERMIT type', async () => {
      const document = await createTestDocument({ documentType: DocumentType.PERMIT });
      expect(document.documentType).toBe(DocumentType.PERMIT);
    });

    it('should accept CERTIFICATE type', async () => {
      const document = await createTestDocument({ documentType: DocumentType.CERTIFICATE });
      expect(document.documentType).toBe(DocumentType.CERTIFICATE);
    });

    it('should accept SAFETY_REPORT type', async () => {
      const document = await createTestDocument({ documentType: DocumentType.SAFETY_REPORT });
      expect(document.documentType).toBe(DocumentType.SAFETY_REPORT);
    });

    it('should accept CONTRACT type', async () => {
      const document = await createTestDocument({ documentType: DocumentType.CONTRACT });
      expect(document.documentType).toBe(DocumentType.CONTRACT);
    });

    it('should accept OTHER type', async () => {
      const document = await createTestDocument({ documentType: DocumentType.OTHER });
      expect(document.documentType).toBe(DocumentType.OTHER);
    });
  });

  describe('Document Status', () => {
    it('should default to UNDER_REVIEW', async () => {
      const document = await createTestDocument();
      expect(document.status).toBe(DocumentStatus.UNDER_REVIEW);
    });

    it('should accept DRAFT status', async () => {
      const document = await createTestDocument({ status: DocumentStatus.DRAFT });
      expect(document.status).toBe(DocumentStatus.DRAFT);
    });

    it('should accept UNDER_REVIEW status', async () => {
      const document = await createTestDocument({ status: DocumentStatus.UNDER_REVIEW });
      expect(document.status).toBe(DocumentStatus.UNDER_REVIEW);
    });

    it('should accept APPROVED status', async () => {
      const document = await createTestDocument({ status: DocumentStatus.APPROVED });
      expect(document.status).toBe(DocumentStatus.APPROVED);
    });

    it('should accept REJECTED status', async () => {
      const document = await createTestDocument({ status: DocumentStatus.REJECTED });
      expect(document.status).toBe(DocumentStatus.REJECTED);
    });
  });

  describe('Pre-save Hook', () => {
    it('should set approvalDate when status changes to APPROVED', async () => {
      const document = await createTestDocument({ status: DocumentStatus.DRAFT });

      document.status = DocumentStatus.APPROVED;
      await document.save();

      expect(document.approvalDate).toBeInstanceOf(Date);
    });

    it('should not overwrite existing approvalDate', async () => {
      const existingDate = new Date('2024-01-01');
      const document = await createTestDocument({ approvalDate: existingDate });

      document.status = DocumentStatus.APPROVED;
      await document.save();

      expect(document.approvalDate).toEqual(existingDate);
    });
  });

  describe('Method: addAccessLog', () => {
    it('should add access log entry', async () => {
      const user = await createTestUser();
      const document = await createTestDocument();

      await document.addAccessLog(user._id, AccessAction.VIEW);

      expect(document.accessLog.length).toBe(1);
      expect(document.accessLog[0].action).toBe(AccessAction.VIEW);
    });

    it('should accept DOWNLOAD action', async () => {
      const user = await createTestUser();
      const document = await createTestDocument();

      await document.addAccessLog(user._id, AccessAction.DOWNLOAD);

      expect(document.accessLog[0].action).toBe(AccessAction.DOWNLOAD);
    });

    it('should accept EDIT action', async () => {
      const user = await createTestUser();
      const document = await createTestDocument();

      await document.addAccessLog(user._id, AccessAction.EDIT);

      expect(document.accessLog[0].action).toBe(AccessAction.EDIT);
    });
  });

  describe('Method: createNewVersion', () => {
    it('should create new version', async () => {
      const user = await createTestUser();
      const document = await createTestDocument();

      await document.createNewVersion('https://example.com/filev2.pdf', user._id);

      expect(document.version).toBe('1.1');
      expect(document.fileUrl).toBe('https://example.com/filev2.pdf');
    });

    it('should save previous version', async () => {
      const user = await createTestUser();
      const document = await createTestDocument();

      await document.createNewVersion('https://example.com/filev2.pdf', user._id);

      expect(document.previousVersions.length).toBe(1);
      expect(document.previousVersions[0].version).toBe('1.0');
    });

    it('should set status to UNDER_REVIEW for new version', async () => {
      const user = await createTestUser();
      const document = await createTestDocument({ status: DocumentStatus.APPROVED });

      await document.createNewVersion('https://example.com/filev2.pdf', user._id);

      expect(document.status).toBe(DocumentStatus.UNDER_REVIEW);
    });

    it('should increment minor version correctly', async () => {
      const user = await createTestUser();
      const document = await createTestDocument({ version: '2.5' });

      await document.createNewVersion('https://example.com/filev2.pdf', user._id);

      expect(document.version).toBe('2.6');
    });
  });

  describe('Tags', () => {
    it('should add tags', async () => {
      const document = await createTestDocument({
        tags: ['construction', 'phase1'],
      });

      expect(document.tags.length).toBe(2);
      expect(document.tags).toContain('construction');
    });
  });

  describe('Defaults', () => {
    it('should set default version to 1.0', async () => {
      const document = await createTestDocument();
      expect(document.version).toBe('1.0');
    });

    it('should set default tags to empty array', async () => {
      const document = await createTestDocument();
      expect(document.tags).toEqual([]);
    });

    it('should set default accessLog to empty array', async () => {
      const document = await createTestDocument();
      expect(document.accessLog).toEqual([]);
    });

    it('should set default previousVersions to empty array', async () => {
      const document = await createTestDocument();
      expect(document.previousVersions).toEqual([]);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const document = await createTestDocument();
      expect(document.createdAt).toBeInstanceOf(Date);
      expect(document.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when document is modified', async () => {
      const document = await createTestDocument();
      const originalUpdatedAt = document.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));
      document.title = 'Updated Document Title';
      await document.save();
      expect(document.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have projectId index', async () => {
      const indexes = DocumentModel.schema.indexes();
      const hasProjectIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].projectId !== undefined
      );
      expect(hasProjectIndex).toBe(true);
    });

    it('should have documentType index', async () => {
      const indexes = DocumentModel.schema.indexes();
      const hasTypeIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].documentType !== undefined
      );
      expect(hasTypeIndex).toBe(true);
    });

    it('should have status index', async () => {
      const indexes = DocumentModel.schema.indexes();
      const hasStatusIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].status !== undefined
      );
      expect(hasStatusIndex).toBe(true);
    });
  });
});

async function createTestDocument(overrides: Partial<IDocument> = {}): Promise<IDocument> {
  const project = await createTestProject();
  const user = await createTestUser();

  const defaultDocument = {
    projectId: project._id,
    documentType: DocumentType.BLUEPRINT,
    title: 'Test Document',
    fileUrl: 'https://example.com/file.pdf',
    uploadedBy: user._id,
  };

  return DocumentModel.create({ ...defaultDocument, ...overrides });
}