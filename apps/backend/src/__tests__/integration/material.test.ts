import request from 'supertest';
import app from '../../app';
import Material from '../../models/Material';
import Supplier from '../../models/Supplier';
import Project from '../../models/Project';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';

describe('Material Management API', () => {
  let adminToken: string;
  let pmToken: string;
  let viewerToken: string;
  let supplierToken: string;
  let adminId: string;
  let pmId: string;
  let projectId: string;
  let supplierId: string;

  beforeEach(async () => {
    const admin = await createTestUser({ email: 'mat-admin@test.com', role: UserRole.ADMIN });
    const pm = await createTestUser({ email: 'mat-pm@test.com', role: UserRole.PROJECT_MANAGER });
    const viewer = await createTestUser({ email: 'mat-viewer@test.com', role: UserRole.VIEWER });
    const supplierUser = await createTestUser({ email: 'mat-supplier@test.com', role: UserRole.SUPPLIER });

    adminId = admin._id.toString();
    pmId = pm._id.toString();

    adminToken = getAuthToken(adminId, admin.email, admin.role);
    pmToken = getAuthToken(pmId, pm.email, pm.role);
    viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);
    supplierToken = getAuthToken(supplierUser._id.toString(), supplierUser.email, supplierUser.role);

    await Project.deleteMany({});
    await Material.deleteMany({});
    await Supplier.deleteMany({});

    // Create project
    const proj = await Project.create({
      projectName: 'Test Project',
      location: { address: 'Test Address' },
      startDate: new Date(),
      endDate: new Date(),
      budget: 500000,
      projectManager: pmId,
      createdBy: adminId,
      teamMembers: [pmId],
    });
    projectId = proj._id.toString();

    // Create supplier
    const sup = await Supplier.create({
      companyName: 'Test Supplier Co',
      contactPerson: 'John Doe',
      email: 'supplier@test.com',
      phoneNumber: '+94771234567',
      materialsSupplied: ['Cement', 'Steel'],
    });
    supplierId = sup._id.toString();
  });

  const getValidMaterialData = () => ({
    projectId,
    materialName: 'Portland Cement',
    category: 'Cement',
    description: 'High-quality cement for construction',
    quantity: 100,
    unit: 'bags',
    unitPrice: 500,
    supplier: supplierId,
    orderDate: new Date().toISOString(),
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    minimumThreshold: 20,
    isEcoFriendly: true,
    recycledContent: 15,
    certifications: ['ISO 9001'],
  });

  describe('POST /api/resources/materials', () => {
    it('should create a material as project manager', async () => {
      const response = await request(app)
        .post('/api/resources/materials')
        .set('Authorization', `Bearer ${pmToken}`)
        .send(getValidMaterialData())
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.materialName).toBe('Portland Cement');
      expect(response.body.data.category).toBe('Cement');
      expect(response.body.data.status).toBe('Ordered');
    });

    it('should create a material as admin', async () => {
      const response = await request(app)
        .post('/api/resources/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(getValidMaterialData())
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should not allow viewer to create material', async () => {
      await request(app)
        .post('/api/resources/materials')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(getValidMaterialData())
        .expect(403);
    });

    it('should return 404 for non-existent project', async () => {
      const data = { ...getValidMaterialData(), projectId: '507f1f77bcf86cd799439011' };
      const response = await request(app)
        .post('/api/resources/materials')
        .set('Authorization', `Bearer ${pmToken}`)
        .send(data)
        .expect(404);

      expect(response.body.error).toContain('Project not found');
    });

    it('should return 404 for non-existent supplier', async () => {
      const data = { ...getValidMaterialData(), supplier: '507f1f77bcf86cd799439011' };
      const response = await request(app)
        .post('/api/resources/materials')
        .set('Authorization', `Bearer ${pmToken}`)
        .send(data)
        .expect(404);

      expect(response.body.error).toContain('Supplier not found');
    });
  });

  describe('GET /api/resources/materials', () => {
    beforeEach(async () => {
      await Material.create(getValidMaterialData());
      await Material.create({ ...getValidMaterialData(), materialName: 'Steel Bars', category: 'Steel', quantity: 50 });
    });

    it('should return all materials', async () => {
      const response = await request(app)
        .get('/api/resources/materials')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter materials by category', async () => {
      const response = await request(app)
        .get('/api/resources/materials?category=Cement')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].category).toBe('Cement');
    });

    it('should filter materials by projectId', async () => {
      const response = await request(app)
        .get(`/api/resources/materials?projectId=${projectId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.data.length).toBe(2);
    });
  });

  describe('GET /api/resources/materials/:id', () => {
    let materialId: string;

    beforeEach(async () => {
      const material = await Material.create(getValidMaterialData());
      materialId = material._id.toString();
    });

    it('should return a material by ID', async () => {
      const response = await request(app)
        .get(`/api/resources/materials/${materialId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.materialName).toBe('Portland Cement');
    });

    it('should return 404 for non-existent material', async () => {
      await request(app)
        .get('/api/resources/materials/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/resources/materials/:id', () => {
    let materialId: string;

    beforeEach(async () => {
      const material = await Material.create(getValidMaterialData());
      materialId = material._id.toString();
    });

    it('should update a material', async () => {
      const response = await request(app)
        .put(`/api/resources/materials/${materialId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ materialName: 'Updated Cement', quantity: 150 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.materialName).toBe('Updated Cement');
      expect(response.body.data.quantity).toBe(150);
    });

    it('should not allow viewer to update', async () => {
      await request(app)
        .put(`/api/resources/materials/${materialId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ materialName: 'Updated' })
        .expect(403);
    });
  });

  describe('DELETE /api/resources/materials/:id', () => {
    let materialId: string;

    beforeEach(async () => {
      const material = await Material.create(getValidMaterialData());
      materialId = material._id.toString();
    });

    it('should delete a material as admin', async () => {
      const response = await request(app)
        .delete(`/api/resources/materials/${materialId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should not allow pm to delete', async () => {
      await request(app)
        .delete(`/api/resources/materials/${materialId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/resources/materials/:id/status', () => {
    let materialId: string;

    beforeEach(async () => {
      const material = await Material.create(getValidMaterialData());
      materialId = material._id.toString();
    });

    it('should update material status', async () => {
      const response = await request(app)
        .put(`/api/resources/materials/${materialId}/status`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'Delivered' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Delivered');
    });

    it('should set currentStock when delivered', async () => {
      const response = await request(app)
        .put(`/api/resources/materials/${materialId}/status`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'Delivered' })
        .expect(200);

      expect(response.body.data.currentStock).toBe(100);
    });
  });

  describe('POST /api/resources/materials/:id/usage', () => {
    let materialId: string;

    beforeEach(async () => {
      const material = await Material.create({
        ...getValidMaterialData(),
        status: 'Delivered',
        currentStock: 100,
      });
      materialId = material._id.toString();
    });

    it('should record material usage', async () => {
      const response = await request(app)
        .post(`/api/resources/materials/${materialId}/usage`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ quantity: 30, purpose: 'Construction', notes: 'Used for foundation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStock).toBe(70);
      expect(response.body.data.usageHistory.length).toBe(1);
    });

    it('should not allow usage exceeding current stock', async () => {
      const response = await request(app)
        .post(`/api/resources/materials/${materialId}/usage`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ quantity: 150 })
        .expect(400);

      expect(response.body.error).toContain('Insufficient stock');
    });
  });

  describe('GET /api/resources/materials/list/low-stock', () => {
    beforeEach(async () => {
      // Create material with low stock
      await Material.create({
        ...getValidMaterialData(),
        status: 'Delivered',
        currentStock: 5,
        minimumThreshold: 20,
      });
      // Create material with adequate stock
      await Material.create({
        ...getValidMaterialData(),
        materialName: 'Adequate Cement',
        status: 'Delivered',
        currentStock: 50,
        minimumThreshold: 20,
      });
    });

    it('should return low stock materials', async () => {
      const response = await request(app)
        .get('/api/resources/materials/list/low-stock')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].materialName).toBe('Portland Cement');
    });
  });

  describe('GET /api/resources/materials/:projectId/cost-summary', () => {
    beforeEach(async () => {
      await Material.create(getValidMaterialData());
      await Material.create({
        ...getValidMaterialData(),
        materialName: 'Steel Bars',
        category: 'Steel',
        quantity: 50,
        unitPrice: 1000,
      });
    });

    it('should return cost summary for project', async () => {
      const response = await request(app)
        .get(`/api/resources/materials/${projectId}/cost-summary`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalMaterialCost).toBe(100000); // 100*500 + 50*1000
      expect(response.body.data.materialCount).toBe(2);
    });
  });
});
