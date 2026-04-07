import request from 'supertest';
import app from '../../app';
import Supplier from '../../models/Supplier';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';
describe('Supplier Management API', () => {
  let adminToken: string;
  let pmToken: string;
  let viewerToken: string;
  let adminId: string;
  beforeEach(async () => {
    const admin = await createTestUser({ email: 'sup-admin@test.com', role: UserRole.ADMIN });
    const pm = await createTestUser({ email: 'sup-pm@test.com', role: UserRole.PROJECT_MANAGER });
    const viewer = await createTestUser({ email: 'sup-viewer@test.com', role: UserRole.VIEWER });
    adminId = admin._id.toString();
    const pmId = pm._id.toString();
    adminToken = getAuthToken(adminId, admin.email, admin.role);
    pmToken = getAuthToken(pmId, pm.email, pm.role);
    viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);
    await Supplier.deleteMany({});
  });
  const validSupplierData = {
    companyName: 'ABC Construction Supplies',
    registrationNumber: 'REG-2024-001',
    vatNumber: 'VAT-12345678',
    contactPerson: 'John Smith',
    email: 'contact@abcsupplies.com',
    phoneNumber: '+94771234567',
    alternatePhone: '+94771234568',
    address: {
      street: '123 Main Street',
      city: 'Colombo',
      state: 'Western',
      country: 'Sri Lanka',
      postalCode: '00100',
    },
    materialsSupplied: ['Cement', 'Steel', 'Bricks'],
    servicesProvided: ['Delivery', 'Installation'],
    paymentTerms: 'Net 30',
    deliveryLeadTime: 7,
    isSustainabilityCertified: true,
    certifications: ['ISO 9001', 'ISO 14001'],
    sustainabilityScore: 8.5,
    isActive: true,
    isPreferred: true,
  };
  describe('POST /api/resources/suppliers', () => {
    it('should create a supplier as project manager', async () => {
      const response = await request(app)
        .post('/api/resources/suppliers')
        .set('Authorization', `Bearer ${pmToken}`)
        .send(validSupplierData)
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.companyName).toBe('ABC Construction Supplies');
      expect(response.body.data.isActive).toBe(true);
    });
    it('should create a supplier as admin', async () => {
      const response = await request(app)
        .post('/api/resources/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validSupplierData)
        .expect(201);
      expect(response.body.success).toBe(true);
    });
    it('should not allow viewer to create supplier', async () => {
      await request(app)
        .post('/api/resources/suppliers')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(validSupplierData)
        .expect(403);
    });
    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/resources/suppliers')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ ...validSupplierData, email: 'invalid-email' })
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });
  describe('GET /api/resources/suppliers', () => {
    beforeEach(async () => {
      await Supplier.create(validSupplierData);
      await Supplier.create({
        ...validSupplierData,
        companyName: 'XYZ Supplies',
        email: 'xyz@supplies.com',
      });
    });
    it('should return all suppliers', async () => {
      const response = await request(app)
        .get('/api/resources/suppliers')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });
    it('should filter suppliers by isActive', async () => {
      const response = await request(app)
        .get('/api/resources/suppliers?isActive=true')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(2);
    });
    it('should filter suppliers by isPreferred', async () => {
      const response = await request(app)
        .get('/api/resources/suppliers?isPreferred=true')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(2);
    });
    it('should search suppliers by company name', async () => {
      const response = await request(app)
        .get('/api/resources/suppliers?search=ABC')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].companyName).toBe('ABC Construction Supplies');
    });
  });
  describe('GET /api/resources/suppliers/:id', () => {
    let supplierId: string;
    beforeEach(async () => {
      const supplier = await Supplier.create(validSupplierData);
      supplierId = supplier._id.toString();
    });
    it('should return supplier by ID', async () => {
      const response = await request(app)
        .get(`/api/resources/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.companyName).toBe('ABC Construction Supplies');
    });
    it('should return 404 for non-existent supplier', async () => {
      await request(app)
        .get('/api/resources/suppliers/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });
  });
  describe('PUT /api/resources/suppliers/:id', () => {
    let supplierId: string;
    beforeEach(async () => {
      const supplier = await Supplier.create(validSupplierData);
      supplierId = supplier._id.toString();
    });
    it('should update a supplier', async () => {
      const response = await request(app)
        .put(`/api/resources/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ companyName: 'Updated Company', paymentTerms: 'Net 60' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.companyName).toBe('Updated Company');
      expect(response.body.data.paymentTerms).toBe('Net 60');
    });
    it('should not allow viewer to update', async () => {
      await request(app)
        .put(`/api/resources/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ companyName: 'Updated' })
        .expect(403);
    });
  });
  describe('DELETE /api/resources/suppliers/:id', () => {
    let supplierId: string;
    beforeEach(async () => {
      const supplier = await Supplier.create(validSupplierData);
      supplierId = supplier._id.toString();
    });
    it('should delete a supplier as admin', async () => {
      const response = await request(app)
        .delete(`/api/resources/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('should not allow pm to delete', async () => {
      await request(app)
        .delete(`/api/resources/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(403);
    });
  });
  describe('POST /api/resources/suppliers/:id/rating', () => {
    let supplierId: string;
    beforeEach(async () => {
      const supplier = await Supplier.create(validSupplierData);
      supplierId = supplier._id.toString();
    });
    it('should rate a supplier', async () => {
      const response = await request(app)
        .post(`/api/resources/suppliers/${supplierId}/rating`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ rating: 4, comment: 'Good quality products' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ratings.length).toBe(1);
      expect(response.body.data.averageRating).toBe(4);
    });
    it('should reject invalid rating', async () => {
      const response = await request(app)
        .post(`/api/resources/suppliers/${supplierId}/rating`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ rating: 6 })
        .expect(400);
      expect(response.body.error).toContain('between 1 and 5');
    });
    it('should calculate average rating correctly', async () => {
      await Supplier.findByIdAndUpdate(supplierId, {
        ratings: [
          { ratedBy: '507f1f77bcf86cd799439011', rating: 4, ratedDate: new Date() },
          { ratedBy: '507f1f77bcf86cd799439012', rating: 5, ratedDate: new Date() },
        ],
        averageRating: 4.5,
      });
      const response = await request(app)
        .post(`/api/resources/suppliers/${supplierId}/rating`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ rating: 5 })
        .expect(200);
      expect(response.body.data.averageRating).toBe(4.67);
    });
  });
  describe('GET /api/resources/suppliers/:id/performance', () => {
    let supplierId: string;
    beforeEach(async () => {
      const supplier = await Supplier.create({
        ...validSupplierData,
        totalOrders: 10,
        completedOrders: 8,
        onTimeDeliveryRate: 75,
        ratings: [
          { ratedBy: '507f1f77bcf86cd799439011', rating: 4, ratedDate: new Date() },
          { ratedBy: '507f1f77bcf86cd799439012', rating: 5, ratedDate: new Date() },
        ],
      });
      supplierId = supplier._id.toString();
    });
    it('should return supplier performance metrics', async () => {
      const response = await request(app)
        .get(`/api/resources/suppliers/${supplierId}/performance`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalOrders).toBe(10);
      expect(response.body.data.completedOrders).toBe(8);
      expect(response.body.data.completionRate).toBe(80);
      expect(response.body.data.onTimeDeliveryRate).toBe(75);
      expect(response.body.data.averageRating).toBe(4.5);
    });
    it('should return 404 for non-existent supplier', async () => {
      await request(app)
        .get('/api/resources/suppliers/507f1f77bcf86cd799439011/performance')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });
  });
});
