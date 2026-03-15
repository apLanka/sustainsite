import ComplianceChecklist, { IComplianceChecklist, ComplianceCategory } from '../../../models/ComplianceChecklist';
import { createTestUser, createTestProject } from '../../helpers/testHelpers';

describe('ComplianceChecklist Model', () => {
  describe('Schema Validation', () => {
    it('should create compliance checklist with valid data', async () => {
      const project = await createTestProject();

      const checklist = await ComplianceChecklist.create({
        projectId: project._id,
        checklistName: 'Environmental Compliance',
        category: ComplianceCategory.ENVIRONMENTAL,
      });

      expect(checklist.checklistName).toBe('Environmental Compliance');
      expect(checklist.category).toBe(ComplianceCategory.ENVIRONMENTAL);
    });

    it('should fail without projectId', async () => {
      await expect(
        ComplianceChecklist.create({
          checklistName: 'Test Checklist',
        })
      ).rejects.toThrow();
    });

    it('should fail without checklistName', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with checklistName shorter than 3 characters', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
          checklistName: 'AB',
        })
      ).rejects.toThrow();
    });

    it('should fail with checklistName longer than 200 characters', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
          checklistName: 'A'.repeat(201),
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid category', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
          checklistName: 'Test Checklist',
          category: 'INVALID' as ComplianceCategory,
        })
      ).rejects.toThrow();
    });

    it('should fail with complianceScore below 0', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
          checklistName: 'Test Checklist',
          complianceScore: -1,
        })
      ).rejects.toThrow();
    });

    it('should fail with complianceScore above 100', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
          checklistName: 'Test Checklist',
          complianceScore: 101,
        })
      ).rejects.toThrow();
    });

    it('should fail with totalItems below 0', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
          checklistName: 'Test Checklist',
          totalItems: -1,
        })
      ).rejects.toThrow();
    });

    it('should fail with completedItems below 0', async () => {
      const project = await createTestProject();

      await expect(
        ComplianceChecklist.create({
          projectId: project._id,
          checklistName: 'Test Checklist',
          completedItems: -1,
        })
      ).rejects.toThrow();
    });
  });

  describe('Compliance Categories', () => {
    it('should accept ENVIRONMENTAL category', async () => {
      const checklist = await createTestComplianceChecklist({ category: ComplianceCategory.ENVIRONMENTAL });
      expect(checklist.category).toBe(ComplianceCategory.ENVIRONMENTAL);
    });

    it('should accept SAFETY category', async () => {
      const checklist = await createTestComplianceChecklist({ category: ComplianceCategory.SAFETY });
      expect(checklist.category).toBe(ComplianceCategory.SAFETY);
    });

    it('should accept BUILDING_CODE category', async () => {
      const checklist = await createTestComplianceChecklist({ category: ComplianceCategory.BUILDING_CODE });
      expect(checklist.category).toBe(ComplianceCategory.BUILDING_CODE);
    });

    it('should accept SUSTAINABILITY_CERTIFICATION category', async () => {
      const checklist = await createTestComplianceChecklist({ category: ComplianceCategory.SUSTAINABILITY_CERTIFICATION });
      expect(checklist.category).toBe(ComplianceCategory.SUSTAINABILITY_CERTIFICATION);
    });
  });

  describe('Pre-save Hook', () => {
    it('should calculate totalItems from items array', async () => {
      const checklist = await ComplianceChecklist.create({
        projectId: (await createTestProject())._id,
        checklistName: 'Test Checklist',
        items: [
          { itemId: '1', itemName: 'Item 1', isCompleted: true },
          { itemId: '2', itemName: 'Item 2', isCompleted: false },
          { itemId: '3', itemName: 'Item 3', isCompleted: true },
        ],
      });

      expect(checklist.totalItems).toBe(3);
    });

    it('should calculate completedItems from items array', async () => {
      const checklist = await ComplianceChecklist.create({
        projectId: (await createTestProject())._id,
        checklistName: 'Test Checklist',
        items: [
          { itemId: '1', itemName: 'Item 1', isCompleted: true },
          { itemId: '2', itemName: 'Item 2', isCompleted: false },
          { itemId: '3', itemName: 'Item 3', isCompleted: true },
        ],
      });

      expect(checklist.completedItems).toBe(2);
    });

    it('should calculate complianceScore correctly', async () => {
      const checklist = await ComplianceChecklist.create({
        projectId: (await createTestProject())._id,
        checklistName: 'Test Checklist',
        items: [
          { itemId: '1', itemName: 'Item 1', isCompleted: true },
          { itemId: '2', itemName: 'Item 2', isCompleted: false },
          { itemId: '3', itemName: 'Item 3', isCompleted: true },
          { itemId: '4', itemName: 'Item 4', isCompleted: true },
        ],
      });

      expect(checklist.complianceScore).toBe(75);
    });

    it('should set complianceScore to 0 when no items', async () => {
      const checklist = await createTestComplianceChecklist({ items: [] });
      expect(checklist.complianceScore).toBe(0);
    });

    it('should set completionDate for completed items', async () => {
      const checklist = await ComplianceChecklist.create({
        projectId: (await createTestProject())._id,
        checklistName: 'Test Checklist',
        items: [
          { itemId: '1', itemName: 'Item 1', isCompleted: true },
        ],
      });

      expect(checklist.items[0].completedDate).toBeInstanceOf(Date);
    });

    it('should not overwrite existing completionDate', async () => {
      const existingDate = new Date('2024-01-01');
      const checklist = await ComplianceChecklist.create({
        projectId: (await createTestProject())._id,
        checklistName: 'Test Checklist',
        items: [
          { itemId: '1', itemName: 'Item 1', isCompleted: true, completedDate: existingDate },
        ],
      });

      expect(checklist.items[0].completedDate).toEqual(existingDate);
    });
  });

  describe('Compliance Items', () => {
    it('should add items with required fields', async () => {
      const checklist = await createTestComplianceChecklist({
        items: [{ itemId: '1', itemName: 'Check emissions', isCompleted: false }],
      });

      expect(checklist.items.length).toBe(1);
      expect(checklist.items[0].itemName).toBe('Check emissions');
    });

    it('should allow item description', async () => {
      const checklist = await createTestComplianceChecklist({
        items: [{ itemId: '1', itemName: 'Item', description: 'Detailed description', isCompleted: false }],
      });

      expect(checklist.items[0].description).toBe('Detailed description');
    });

    it('should track completion status', async () => {
      const checklist = await createTestComplianceChecklist({
        items: [{ itemId: '1', itemName: 'Item', isCompleted: true }],
      });

      expect(checklist.items[0].isCompleted).toBe(true);
    });

    it('should add attached documents', async () => {
      const user = await createTestUser();
      const checklist = await createTestComplianceChecklist({
        items: [
          {
            itemId: '1',
            itemName: 'Item',
            isCompleted: false,
            attachedDocuments: [],
          },
        ],
      });

      expect(checklist.items[0].attachedDocuments).toEqual([]);
    });

    it('should fail without itemId', async () => {
      const checklist = await createTestComplianceChecklist();
      checklist.items.push({ itemId: '', itemName: 'Item' } as any);

      await expect(checklist.save()).rejects.toThrow();
    });

    it('should fail without itemName', async () => {
      const checklist = await createTestComplianceChecklist();
      checklist.items.push({ itemId: '1' } as any);

      await expect(checklist.save()).rejects.toThrow();
    });
  });

  describe('Defaults', () => {
    it('should set default totalItems to 0', async () => {
      const checklist = await createTestComplianceChecklist();
      expect(checklist.totalItems).toBe(0);
    });

    it('should set default completedItems to 0', async () => {
      const checklist = await createTestComplianceChecklist();
      expect(checklist.completedItems).toBe(0);
    });

    it('should set default complianceScore to 0', async () => {
      const checklist = await createTestComplianceChecklist();
      expect(checklist.complianceScore).toBe(0);
    });

    it('should set default items to empty array', async () => {
      const checklist = await createTestComplianceChecklist();
      expect(checklist.items).toEqual([]);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const checklist = await createTestComplianceChecklist();
      expect(checklist.createdAt).toBeInstanceOf(Date);
      expect(checklist.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when checklist is modified', async () => {
      const checklist = await createTestComplianceChecklist();
      const originalUpdatedAt = checklist.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));
      checklist.checklistName = 'Updated Checklist Name';
      await checklist.save();
      expect(checklist.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have projectId index', async () => {
      const indexes = ComplianceChecklist.schema.indexes();
      const hasProjectIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].projectId !== undefined
      );
      expect(hasProjectIndex).toBe(true);
    });

    it('should have category index', async () => {
      const indexes = ComplianceChecklist.schema.indexes();
      const hasCategoryIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].category !== undefined
      );
      expect(hasCategoryIndex).toBe(true);
    });

    it('should have complianceScore index', async () => {
      const indexes = ComplianceChecklist.schema.indexes();
      const hasScoreIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].complianceScore !== undefined
      );
      expect(hasScoreIndex).toBe(true);
    });
  });
});

async function createTestComplianceChecklist(overrides: Partial<IComplianceChecklist> = {}): Promise<IComplianceChecklist> {
  const project = await createTestProject();

  const defaultChecklist = {
    projectId: project._id,
    checklistName: 'Test Compliance Checklist',
  };

  return ComplianceChecklist.create({ ...defaultChecklist, ...overrides });
}