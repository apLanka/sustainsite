import Material, { IMaterial, MaterialCategory, MaterialStatus } from '../../../models/Material';
import { createTestUser, createTestMaterial, createTestSupplier, createTestProject } from '../../helpers/testHelpers';

describe('Material Model', () => {
  describe('Schema Validation', () => {
    it('should create material with valid data', async () => {
      const material = await createTestMaterial({
        materialName: 'Portland Cement',
        category: MaterialCategory.CEMENT,
        quantity: 500,
        unit: 'bags',
        unitPrice: 15,
        status: MaterialStatus.ORDERED,
      });

      expect(material.materialName).toBe('Portland Cement');
      expect(material.category).toBe(MaterialCategory.CEMENT);
      expect(material.quantity).toBe(500);
      expect(material.unitPrice).toBe(15);
    });

    it('should fail without projectId', async () => {
      const supplier = await createTestSupplier();
      const user = await createTestUser();

      await expect(
        Material.create({
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unit: 'bags',
          unitPrice: 10,
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without materialName', async () => {
      const material = await createTestMaterial();
      material.materialName = undefined as any;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail with materialName shorter than 2 characters', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'A',
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unit: 'bags',
          unitPrice: 10,
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with materialName longer than 200 characters', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'A'.repeat(201),
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unit: 'bags',
          unitPrice: 10,
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without category', async () => {
      const material = await createTestMaterial();
      material.category = undefined as any;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail without quantity', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          unit: 'bags',
          unitPrice: 10,
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative quantity', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          quantity: -10,
          unit: 'bags',
          unitPrice: 10,
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without unit', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unitPrice: 10,
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without unitPrice', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unit: 'bags',
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative unitPrice', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unit: 'bags',
          unitPrice: -10,
          supplier: supplier._id,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without supplier', async () => {
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unit: 'bags',
          unitPrice: 10,
          orderDate: new Date(),
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without orderDate', async () => {
      const supplier = await createTestSupplier();
      const project = await createTestProject();
      const user = await createTestUser();

      await expect(
        Material.create({
          projectId: project._id,
          materialName: 'Test Material',
          category: MaterialCategory.CEMENT,
          quantity: 100,
          unit: 'bags',
          unitPrice: 10,
          supplier: supplier._id,
          createdBy: user._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      const material = await createTestMaterial();
      material.status = 'INVALID' as MaterialStatus;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail with sustainabilityRating below 0', async () => {
      const material = await createTestMaterial();
      material.sustainabilityRating = -1;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail with sustainabilityRating above 10', async () => {
      const material = await createTestMaterial();
      material.sustainabilityRating = 11;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail with recycledContent below 0', async () => {
      const material = await createTestMaterial();
      material.recycledContent = -1;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail with recycledContent above 100', async () => {
      const material = await createTestMaterial();
      material.recycledContent = 101;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail with negative currentStock', async () => {
      const material = await createTestMaterial();
      material.currentStock = -10;

      await expect(material.save()).rejects.toThrow();
    });

    it('should fail with negative minimumThreshold', async () => {
      const material = await createTestMaterial();
      material.minimumThreshold = -5;

      await expect(material.save()).rejects.toThrow();
    });
  });

  describe('Pre-save Hook', () => {
    it('should calculate totalCost from quantity and unitPrice', async () => {
      const material = await createTestMaterial({
        quantity: 100,
        unitPrice: 15,
      });

      expect(material.totalCost).toBe(1500);
    });

    it('should update currentStock when delivered', async () => {
      const material = await createTestMaterial({
        quantity: 100,
        currentStock: 0,
        status: MaterialStatus.DELIVERED,
      });

      await material.save();
      expect(material.currentStock).toBe(100);
    });

    it('should not update currentStock if already set when delivered', async () => {
      const material = await createTestMaterial({
        quantity: 100,
        currentStock: 50,
        status: MaterialStatus.DELIVERED,
      });

      await material.save();
      expect(material.currentStock).toBe(50);
    });
  });

  describe('Method: checkLowStock', () => {
    it('should return true when stock is below threshold', async () => {
      const material = await createTestMaterial({
        currentStock: 10,
        minimumThreshold: 20,
      });

      expect(material.checkLowStock()).toBe(true);
    });

    it('should return false when stock is at threshold', async () => {
      const material = await createTestMaterial({
        currentStock: 20,
        minimumThreshold: 20,
      });

      expect(material.checkLowStock()).toBe(false);
    });

    it('should return false when stock is above threshold', async () => {
      const material = await createTestMaterial({
        currentStock: 30,
        minimumThreshold: 20,
      });

      expect(material.checkLowStock()).toBe(false);
    });
  });

  describe('Method: recordUsage', () => {
    it('should record usage and decrease stock', async () => {
      const user = await createTestUser();
      const material = await createTestMaterial({
        currentStock: 100,
        status: MaterialStatus.IN_STOCK,
      });

      await material.recordUsage(30, user._id, 'Construction use');

      expect(material.currentStock).toBe(70);
      expect(material.usageHistory.length).toBe(1);
      expect(material.usageHistory[0].usedQuantity).toBe(30);
    });

    it('should throw error when insufficient stock', async () => {
      const user = await createTestUser();
      const material = await createTestMaterial({
        currentStock: 20,
        status: MaterialStatus.IN_STOCK,
      });

      await expect(
        material.recordUsage(30, user._id, 'Construction use')
      ).rejects.toThrow('Insufficient stock');
    });

    it('should set status to USED when stock reaches zero', async () => {
      const user = await createTestUser();
      const material = await createTestMaterial({
        currentStock: 30,
        status: MaterialStatus.IN_STOCK,
      });

      await material.recordUsage(30, user._id, 'Construction use');

      expect(material.currentStock).toBe(0);
      expect(material.status).toBe(MaterialStatus.USED);
    });

    it('should record purpose in usage history', async () => {
      const user = await createTestUser();
      const material = await createTestMaterial({
        currentStock: 100,
        status: MaterialStatus.IN_STOCK,
      });

      await material.recordUsage(30, user._id, 'Foundation work');

      expect(material.usageHistory[0].purpose).toBe('Foundation work');
    });
  });

  describe('Material Categories', () => {
    it('should accept CEMENT category', async () => {
      const material = await createTestMaterial({ category: MaterialCategory.CEMENT });
      expect(material.category).toBe(MaterialCategory.CEMENT);
    });

    it('should accept STEEL category', async () => {
      const material = await createTestMaterial({ category: MaterialCategory.STEEL });
      expect(material.category).toBe(MaterialCategory.STEEL);
    });

    it('should accept WOOD category', async () => {
      const material = await createTestMaterial({ category: MaterialCategory.WOOD });
      expect(material.category).toBe(MaterialCategory.WOOD);
    });

    it('should accept AGGREGATES category', async () => {
      const material = await createTestMaterial({ category: MaterialCategory.AGGREGATES });
      expect(material.category).toBe(MaterialCategory.AGGREGATES);
    });

    it('should accept BRICKS category', async () => {
      const material = await createTestMaterial({ category: MaterialCategory.BRICKS });
      expect(material.category).toBe(MaterialCategory.BRICKS);
    });

    it('should accept EQUIPMENT category', async () => {
      const material = await createTestMaterial({ category: MaterialCategory.EQUIPMENT });
      expect(material.category).toBe(MaterialCategory.EQUIPMENT);
    });

    it('should accept OTHER category', async () => {
      const material = await createTestMaterial({ category: MaterialCategory.OTHER });
      expect(material.category).toBe(MaterialCategory.OTHER);
    });
  });

  describe('Material Status', () => {
    it('should default to ORDERED status', async () => {
      const material = await createTestMaterial();
      expect(material.status).toBe(MaterialStatus.ORDERED);
    });

    it('should accept IN_TRANSIT status', async () => {
      const material = await createTestMaterial({ status: MaterialStatus.IN_TRANSIT });
      expect(material.status).toBe(MaterialStatus.IN_TRANSIT);
    });

    it('should accept DELIVERED status', async () => {
      const material = await createTestMaterial({ status: MaterialStatus.DELIVERED });
      expect(material.status).toBe(MaterialStatus.DELIVERED);
    });

    it('should accept IN_STOCK status', async () => {
      const material = await createTestMaterial({ status: MaterialStatus.IN_STOCK });
      expect(material.status).toBe(MaterialStatus.IN_STOCK);
    });

    it('should accept USED status', async () => {
      const material = await createTestMaterial({ status: MaterialStatus.USED });
      expect(material.status).toBe(MaterialStatus.USED);
    });

    it('should accept CANCELLED status', async () => {
      const material = await createTestMaterial({ status: MaterialStatus.CANCELLED });
      expect(material.status).toBe(MaterialStatus.CANCELLED);
    });
  });

  describe('Defaults', () => {
    it('should set default currentStock to 0', async () => {
      const material = await createTestMaterial();
      expect(material.currentStock).toBe(0);
    });

    it('should set default minimumThreshold to 0', async () => {
      const material = await createTestMaterial();
      expect(material.minimumThreshold).toBe(0);
    });

    it('should set default recycledContent to 0', async () => {
      const material = await createTestMaterial();
      expect(material.recycledContent).toBe(0);
    });

    it('should set default isEcoFriendly to false', async () => {
      const material = await createTestMaterial({ isEcoFriendly: undefined });
      expect(material.isEcoFriendly).toBe(false);
    });

    it('should calculate totalCost from quantity and unitPrice', async () => {
      const material = await createTestMaterial({
        quantity: 100,
        unitPrice: 10,
      });
      expect(material.totalCost).toBe(1000);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const material = await createTestMaterial();
      expect(material.createdAt).toBeInstanceOf(Date);
      expect(material.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when material is modified', async () => {
      const material = await createTestMaterial();
      const originalUpdatedAt = material.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));
      material.materialName = 'Updated Material Name';
      await material.save();
      expect(material.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});