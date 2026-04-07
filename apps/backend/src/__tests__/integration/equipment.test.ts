import request from 'supertest';
import app from '../../app';
import Equipment from '../../models/Equipment';
import Project from '../../models/Project';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';
describe('Equipment Management API', () => {
  let adminToken: string;
  let pmToken: string;
  let viewerToken: string;
  let adminId: string;
  let pmId: string;
  let projectId: string;
  beforeEach(async () => {
    const admin = await createTestUser({ email: 'equip-admin@test.com', role: UserRole.ADMIN });
    const pm = await createTestUser({ email: 'equip-pm@test.com', role: UserRole.PROJECT_MANAGER });
    const viewer = await createTestUser({ email: 'equip-viewer@test.com', role: UserRole.VIEWER });
    adminId = admin._id.toString();
    pmId = pm._id.toString();
    adminToken = getAuthToken(adminId, admin.email, admin.role);
    pmToken = getAuthToken(pmId, pm.email, pm.role);
    viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);
    await Project.deleteMany({});
    await Equipment.deleteMany({});
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
  });
  const validEquipmentData = {
    equipmentName: 'Excavator CAT 320',
    equipmentType: 'Excavator',
    serialNumber: 'CAT320-2024-001',
    assetId: 'AST-001',
    manufacturer: 'Caterpillar',
    equipmentModel: '320',
    yearOfManufacture: 2022,
    purchasePrice: 150000,
    currentValue: 120000,
    depreciationRate: 20,
    rentalRatePerDay: 5000,
    currentLocation: 'Warehouse A',
  };
  describe('POST /api/resources/equipment', () => {
    it('should create equipment as project manager', async () => {
      const response = await request(app)
        .post('/api/resources/equipment')
        .set('Authorization', `Bearer ${pmToken}`)
        .send(validEquipmentData)
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.equipmentName).toBe('Excavator CAT 320');
      expect(response.body.data.status).toBe('Available');
    });
    it('should create equipment as admin', async () => {
      const response = await request(app)
        .post('/api/resources/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validEquipmentData)
        .expect(201);
      expect(response.body.success).toBe(true);
    });
    it('should not allow viewer to create equipment', async () => {
      await request(app)
        .post('/api/resources/equipment')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(validEquipmentData)
        .expect(403);
    });
  });
  describe('GET /api/resources/equipment', () => {
    beforeEach(async () => {
      await Equipment.create(validEquipmentData);
      await Equipment.create({
        ...validEquipmentData,
        equipmentName: 'Crane X500',
        equipmentType: 'Crane',
        serialNumber: 'CRANE-2024-002',
        assetId: 'AST-002',
      });
    });
    it('should return all equipment', async () => {
      const response = await request(app)
        .get('/api/resources/equipment')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });
    it('should filter equipment by type', async () => {
      const response = await request(app)
        .get('/api/resources/equipment?type=Excavator')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].equipmentType).toBe('Excavator');
    });
    it('should filter equipment by status', async () => {
      const response = await request(app)
        .get('/api/resources/equipment?status=Available')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(2);
    });
  });
  describe('GET /api/resources/equipment/:id', () => {
    let equipmentId: string;
    beforeEach(async () => {
      const equipment = await Equipment.create(validEquipmentData);
      equipmentId = equipment._id.toString();
    });
    it('should return equipment by ID', async () => {
      const response = await request(app)
        .get(`/api/resources/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.equipmentName).toBe('Excavator CAT 320');
    });
    it('should return 404 for non-existent equipment', async () => {
      await request(app)
        .get('/api/resources/equipment/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });
  });
  describe('PUT /api/resources/equipment/:id', () => {
    let equipmentId: string;
    beforeEach(async () => {
      const equipment = await Equipment.create(validEquipmentData);
      equipmentId = equipment._id.toString();
    });
    it('should update equipment', async () => {
      const response = await request(app)
        .put(`/api/resources/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ equipmentName: 'Updated Excavator', currentLocation: 'Site B' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.equipmentName).toBe('Updated Excavator');
      expect(response.body.data.currentLocation).toBe('Site B');
    });
    it('should not allow viewer to update', async () => {
      await request(app)
        .put(`/api/resources/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ equipmentName: 'Updated' })
        .expect(403);
    });
  });
  describe('DELETE /api/resources/equipment/:id', () => {
    let equipmentId: string;
    beforeEach(async () => {
      const equipment = await Equipment.create(validEquipmentData);
      equipmentId = equipment._id.toString();
    });
    it('should delete equipment as admin', async () => {
      const response = await request(app)
        .delete(`/api/resources/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
    it('should not allow pm to delete', async () => {
      await request(app)
        .delete(`/api/resources/equipment/${equipmentId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(403);
    });
  });
  describe('POST /api/resources/equipment/:id/assign', () => {
    let equipmentId: string;
    beforeEach(async () => {
      const equipment = await Equipment.create(validEquipmentData);
      equipmentId = equipment._id.toString();
    });
    it('should assign equipment to project', async () => {
      const response = await request(app)
        .post(`/api/resources/equipment/${equipmentId}/assign`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('In Use');
      expect(response.body.data.currentProjectId).toBe(projectId);
      expect(response.body.data.assignmentHistory.length).toBe(1);
    });
    it('should not assign unavailable equipment', async () => {
      await Equipment.findByIdAndUpdate(equipmentId, { status: 'Under Maintenance' });
      const response = await request(app)
        .post(`/api/resources/equipment/${equipmentId}/assign`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId })
        .expect(400);
      expect(response.body.error).toContain('not available');
    });
  });
  describe('POST /api/resources/equipment/:id/maintenance', () => {
    let equipmentId: string;
    beforeEach(async () => {
      const equipment = await Equipment.create(validEquipmentData);
      equipmentId = equipment._id.toString();
    });
    it('should schedule maintenance for equipment', async () => {
      const response = await request(app)
        .post(`/api/resources/equipment/${equipmentId}/maintenance`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          maintenanceType: 'Routine',
          description: 'Regular oil change',
          cost: 500,
          performedBy: 'John Mechanic',
          nextMaintenanceMonths: 3,
        })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.maintenanceHistory.length).toBe(1);
      expect(response.body.data.lastMaintenanceDate).toBeDefined();
      expect(response.body.data.nextScheduledMaintenance).toBeDefined();
    });
    it('should mark equipment as under maintenance for repair', async () => {
      const response = await request(app)
        .post(`/api/resources/equipment/${equipmentId}/maintenance`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          maintenanceType: 'Repair',
          description: 'Engine repair',
        })
        .expect(200);
      expect(response.body.data.status).toBe('Under Maintenance');
    });
  });
  describe('PUT /api/resources/equipment/:id/status', () => {
    let equipmentId: string;
    beforeEach(async () => {
      const equipment = await Equipment.create(validEquipmentData);
      equipmentId = equipment._id.toString();
    });
    it('should update equipment status', async () => {
      const response = await request(app)
        .put(`/api/resources/equipment/${equipmentId}/status`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'Damaged' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Damaged');
    });
    it('should clear assignment when marked available', async () => {
      await request(app)
        .post(`/api/resources/equipment/${equipmentId}/assign`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId });
      const response = await request(app)
        .put(`/api/resources/equipment/${equipmentId}/status`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'Available' })
        .expect(200);
      expect(response.body.data.status).toBe('Available');
      expect(response.body.data.currentProjectId).toBeUndefined();
    });
  });
  describe('GET /api/resources/equipment/list/available', () => {
    beforeEach(async () => {
      await Equipment.create(validEquipmentData);
      await Equipment.create({
        ...validEquipmentData,
        equipmentName: 'Used Excavator',
        status: 'In Use',
        serialNumber: 'USED-001',
        assetId: 'AST-003',
      });
    });
    it('should return available equipment', async () => {
      const response = await request(app)
        .get('/api/resources/equipment/list/available')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].equipmentName).toBe('Excavator CAT 320');
    });
    it('should filter available equipment by type', async () => {
      const response = await request(app)
        .get('/api/resources/equipment/list/available?type=Excavator')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.count).toBe(1);
    });
  });
});
