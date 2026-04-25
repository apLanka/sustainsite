import Supplier, { ISupplier } from '../../../models/Supplier';
import { createTestUser, createTestSupplier } from '../../helpers/testHelpers';

describe('Supplier Model', () => {
  describe('Schema Validation', () => {
    it('should create supplier with valid data', async () => {
      const supplier = await Supplier.create({
        companyName: 'Green Materials Ltd',
        contactPerson: 'Jane Smith',
        email: 'contact@greenmaterials.com',
        phoneNumber: '+94771234567',
        address: { street: '123 Supply St', city: 'Colombo', country: 'Sri Lanka' },
        materialsSupplied: ['Cement', 'Steel', 'Wood'],
        servicesProvided: ['Delivery', 'Installation'],
      });

      expect(supplier.companyName).toBe('Green Materials Ltd');
      expect(supplier.contactPerson).toBe('Jane Smith');
      expect(supplier.email).toBe('contact@greenmaterials.com');
    });

    it('should fail without companyName', async () => {
      await expect(
        Supplier.create({
          contactPerson: 'John Doe',
          email: 'test@supplier.com',
          phoneNumber: '+94771234567',
        })
      ).rejects.toThrow();
    });

    it('should fail with companyName shorter than 2 characters', async () => {
      await expect(
        Supplier.create({
          companyName: 'A',
          contactPerson: 'John Doe',
          email: 'test@supplier.com',
          phoneNumber: '+94771234567',
        })
      ).rejects.toThrow();
    });

    it('should fail with companyName longer than 200 characters', async () => {
      await expect(
        Supplier.create({
          companyName: 'A'.repeat(201),
          contactPerson: 'John Doe',
          email: 'test@supplier.com',
          phoneNumber: '+94771234567',
        })
      ).rejects.toThrow();
    });

    it('should fail without contactPerson', async () => {
      await expect(
        Supplier.create({
          companyName: 'Test Supplier',
          email: 'test@supplier.com',
          phoneNumber: '+94771234567',
        })
      ).rejects.toThrow();
    });

    it('should fail without email', async () => {
      await expect(
        Supplier.create({
          companyName: 'Test Supplier',
          contactPerson: 'John Doe',
          phoneNumber: '+94771234567',
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      await expect(
        Supplier.create({
          companyName: 'Test Supplier',
          contactPerson: 'John Doe',
          email: 'invalid-email',
          phoneNumber: '+94771234567',
        })
      ).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const supplier = await Supplier.create({
        companyName: 'Test Supplier',
        contactPerson: 'John Doe',
        email: 'TEST@SUPPLIER.COM',
        phoneNumber: '+94771234567',
      });
      expect(supplier.email).toBe('test@supplier.com');
    });

    it('should fail without phoneNumber', async () => {
      await expect(
        Supplier.create({
          companyName: 'Test Supplier',
          contactPerson: 'John Doe',
          email: 'test@supplier.com',
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid phoneNumber format', async () => {
      await expect(
        Supplier.create({
          companyName: 'Test Supplier',
          contactPerson: 'John Doe',
          email: 'test@supplier.com',
          phoneNumber: 'invalid',
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid alternatePhone format', async () => {
      const supplier = await createTestSupplier();
      supplier.alternatePhone = 'invalid';

      await expect(supplier.save()).rejects.toThrow();
    });

    it('should fail with invalid onTimeDeliveryRate below 0', async () => {
      const supplier = await createTestSupplier();
      supplier.onTimeDeliveryRate = -1;

      await expect(supplier.save()).rejects.toThrow();
    });

    it('should fail with onTimeDeliveryRate above 100', async () => {
      const supplier = await createTestSupplier();
      supplier.onTimeDeliveryRate = 101;

      await expect(supplier.save()).rejects.toThrow();
    });

    it('should fail with averageRating below 0', async () => {
      const supplier = await createTestSupplier();
      supplier.averageRating = -1;

      await expect(supplier.save()).rejects.toThrow();
    });

    it('should fail with averageRating above 5', async () => {
      const supplier = await createTestSupplier();
      supplier.averageRating = 6;

      await expect(supplier.save()).rejects.toThrow();
    });

    it('should fail with sustainabilityScore below 0', async () => {
      const supplier = await createTestSupplier();
      supplier.sustainabilityScore = -1;

      await expect(supplier.save()).rejects.toThrow();
    });

    it('should fail with sustainabilityScore above 10', async () => {
      const supplier = await createTestSupplier();
      supplier.sustainabilityScore = 11;

      await expect(supplier.save()).rejects.toThrow();
    });

    it('should enforce unique companyName', async () => {
      await createTestSupplier({ companyName: 'Unique Supplier Co' });
      await expect(
        createTestSupplier({ companyName: 'Unique Supplier Co' })
      ).rejects.toThrow();
    });

    it('should fail with delivery leadTime below 0', async () => {
      const supplier = await createTestSupplier();
      supplier.deliveryLeadTime = -1;

      await expect(supplier.save()).rejects.toThrow();
    });
  });

  describe('Pre-save Hook', () => {
    it('should calculate averageRating from ratings array', async () => {
      const user = await createTestUser();
      const supplier = await createTestSupplier();

      supplier.ratings = [
        { ratedBy: user._id, rating: 4, comment: 'Good', ratedDate: new Date() },
        { ratedBy: user._id, rating: 5, comment: 'Excellent', ratedDate: new Date() },
      ];

      await supplier.save();
      expect(supplier.averageRating).toBe(4.5);
    });

    it('should set averageRating to 0 when no ratings', async () => {
      const supplier = await createTestSupplier();
      supplier.ratings = [];

      await supplier.save();
      expect(supplier.averageRating).toBe(0);
    });
  });

  describe('Method: addRating', () => {
    it('should add rating to supplier', async () => {
      const user = await createTestUser();
      const supplier = await createTestSupplier();

      await supplier.addRating(user._id, 4, 'Good service');

      expect(supplier.ratings.length).toBe(1);
      expect(supplier.ratings[0].rating).toBe(4);
      expect(supplier.ratings[0].comment).toBe('Good service');
    });

    it('should update averageRating after adding rating', async () => {
      const user = await createTestUser();
      const supplier = await createTestSupplier();

      await supplier.addRating(user._id, 5);

      expect(supplier.averageRating).toBe(5);
    });

    it('should accept rating without comment', async () => {
      const user = await createTestUser();
      const supplier = await createTestSupplier();

      await supplier.addRating(user._id, 4);

      expect(supplier.ratings[0].comment).toBeUndefined();
    });
  });

  describe('Method: updatePerformanceMetrics', () => {
    it('should increment totalOrders and completedOrders', async () => {
      const supplier = await createTestSupplier();

      await supplier.updatePerformanceMetrics(true);

      expect(supplier.totalOrders).toBe(1);
      expect(supplier.completedOrders).toBe(1);
    });

    it('should update onTimeDeliveryRate for on-time delivery', async () => {
      const supplier = await createTestSupplier({
        onTimeDeliveryRate: 80,
        totalOrders: 10,
        completedOrders: 10,
      });

      await supplier.updatePerformanceMetrics(true);

      expect(supplier.onTimeDeliveryRate).toBeGreaterThan(80);
    });

    it('should maintain correct onTimeDeliveryRate calculation', async () => {
      const supplier = await createTestSupplier({
        onTimeDeliveryRate: 100,
        totalOrders: 0,
        completedOrders: 0,
      });

      await supplier.updatePerformanceMetrics(true);

      expect(supplier.onTimeDeliveryRate).toBe(100);
    });
  });

  describe('Defaults', () => {
    it('should set default isActive to true', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.isActive).toBe(true);
    });

    it('should set default isPreferred to false', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.isPreferred).toBe(false);
    });

    it('should set default blacklisted to false', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.blacklisted).toBe(false);
    });

    it('should set default isSustainabilityCertified to false', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.isSustainabilityCertified).toBe(false);
    });

    it('should set default totalOrders to 0', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.totalOrders).toBe(0);
    });

    it('should set default completedOrders to 0', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.completedOrders).toBe(0);
    });

    it('should set default onTimeDeliveryRate to 0', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.onTimeDeliveryRate).toBe(0);
    });

    it('should set default averageRating to 0', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.averageRating).toBe(0);
    });

    it('should set default materialsSupplied to empty array', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.materialsSupplied).toEqual([]);
    });

    it('should set default servicesProvided to empty array', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.servicesProvided).toEqual([]);
    });

    it('should set default certifications to empty array', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.certifications).toEqual([]);
    });
  });

  describe('Blacklist', () => {
    it('should blacklist supplier with reason', async () => {
      const supplier = await createTestSupplier({
        blacklisted: true,
        blacklistReason: 'Quality issues',
      });

      expect(supplier.blacklisted).toBe(true);
      expect(supplier.blacklistReason).toBe('Quality issues');
    });

    it('should allow unblacklisting', async () => {
      const supplier = await createTestSupplier({
        blacklisted: true,
        blacklistReason: 'Old issue',
      });
      supplier.blacklisted = false;
      supplier.blacklistReason = undefined;

      await supplier.save();
      expect(supplier.blacklisted).toBe(false);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const supplier = await createTestSupplier();
      expect(supplier.createdAt).toBeInstanceOf(Date);
      expect(supplier.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when supplier is modified', async () => {
      const supplier = await createTestSupplier();
      const originalUpdatedAt = supplier.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));
      supplier.companyName = 'Updated Supplier Name';
      await supplier.save();
      expect(supplier.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have email index', async () => {
      const indexes = Supplier.schema.indexes();
      const hasEmailIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].email !== undefined
      );
      expect(hasEmailIndex).toBe(true);
    });

    it('should have isActive index', async () => {
      const indexes = Supplier.schema.indexes();
      const hasActiveIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].isActive !== undefined
      );
      expect(hasActiveIndex).toBe(true);
    });

    it('should have averageRating index', async () => {
      const indexes = Supplier.schema.indexes();
      const hasRatingIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].averageRating !== undefined
      );
      expect(hasRatingIndex).toBe(true);
    });
  });
});