import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import ComplianceChecklist, { ComplianceCategory } from '../../models/ComplianceChecklist';
import SafetyInspection, {
  RiskLevel,
  ActionStatus,
  InspectionType,
  IssueSeverity,
} from '../../models/SafetyInspection';
import Project from '../../models/Project';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';
describe('Compliance Management API', () => {
  let adminToken: string;
  let pmToken: string;
  let inspectorToken: string;
  let viewerToken: string;
  let adminId: string;
  let pmId: string;
  let inspectorId: string;
  let projectId: string;
  beforeEach(async () => {
    const admin = await createTestUser({ email: 'comp-admin@test.com', role: UserRole.ADMIN });
    const pm = await createTestUser({ email: 'comp-pm@test.com', role: UserRole.PROJECT_MANAGER });
    const inspector = await createTestUser({
      email: 'comp-inspector@test.com',
      role: UserRole.INSPECTOR,
    });
    const viewer = await createTestUser({ email: 'comp-viewer@test.com', role: UserRole.VIEWER });
    adminId = admin._id.toString();
    pmId = pm._id.toString();
    inspectorId = inspector._id.toString();
    adminToken = getAuthToken(adminId, admin.email, admin.role);
    pmToken = getAuthToken(pmId, pm.email, pm.role);
    inspectorToken = getAuthToken(inspectorId, inspector.email, inspector.role);
    viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);
    await ComplianceChecklist.deleteMany({});
    await SafetyInspection.deleteMany({});
    await Project.deleteMany({});
    const proj = await Project.create({
      projectName: 'Compliance Test Project',
      location: { address: '123 Site Road' },
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      budget: 100000,
      projectManager: pmId,
      createdBy: adminId,
    });
    projectId = proj._id.toString();
  });
  const seedChecklist = async (overrides: Record<string, unknown> = {}) => {
    return ComplianceChecklist.create({
      projectId,
      checklistName: 'Safety Standards Checklist',
      category: ComplianceCategory.SAFETY,
      items: [
        { itemId: 'item-1', itemName: 'Fire extinguishers installed', isCompleted: true },
        { itemId: 'item-2', itemName: 'Emergency exits marked', isCompleted: false },
      ],
      createdBy: pmId,
      ...overrides,
    });
  };
  const seedInspection = async (overrides: Record<string, unknown> = {}) => {
    return SafetyInspection.create({
      projectId,
      inspectionType: InspectionType.SAFETY,
      inspectionDate: new Date(),
      inspector: inspectorId,
      findings: 'Workers not wearing safety helmets on level 2',
      riskLevel: RiskLevel.HIGH,
      issuesIdentified: [
        { issue: 'No helmets', severity: IssueSeverity.MAJOR, location: 'Level 2' },
      ],
      actionRequired: 'Provide helmets to all workers',
      recommendedActions: ['Order 20 helmets', 'Brief site manager'],
      actionStatus: ActionStatus.PENDING,
      ...overrides,
    });
  };
  describe('POST /api/compliance/checklists', () => {
    it('should create a checklist and auto-calculate compliance score', async () => {
      const response = await request(app)
        .post('/api/compliance/checklists')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          projectId,
          checklistName: 'Environmental Compliance Q1',
          category: ComplianceCategory.ENVIRONMENTAL,
          items: [
            { itemId: '1', itemName: 'EIA submitted', isCompleted: true },
            { itemId: '2', itemName: 'Waste plan approved', isCompleted: false },
          ],
          dueDate: new Date(Date.now() + 86400000),
        })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.checklistName).toBe('Environmental Compliance Q1');
      expect(response.body.data.totalItems).toBe(2);
      expect(response.body.data.completedItems).toBe(1);
      expect(response.body.data.complianceScore).toBe(50);
      expect(response.body.data.createdBy.toString()).toBe(pmId);
    });
    it('should create a checklist with no items (score = 0)', async () => {
      const response = await request(app)
        .post('/api/compliance/checklists')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId, checklistName: 'Empty Checklist' })
        .expect(201);
      expect(response.body.data.totalItems).toBe(0);
      expect(response.body.data.complianceScore).toBe(0);
    });
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/compliance/checklists')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId })
        .expect(400);
      expect(response.body.error).toBe('projectId and checklistName are required');
    });
    it('should return 400 for invalid projectId format', async () => {
      const response = await request(app)
        .post('/api/compliance/checklists')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectId: 'not-valid', checklistName: 'Test' })
        .expect(400);
      expect(response.body.error).toBe('Invalid projectId format');
    });
    it('should return 403 if VIEWER tries to create', async () => {
      await request(app)
        .post('/api/compliance/checklists')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ projectId, checklistName: 'Viewer Checklist' })
        .expect(403);
    });
    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/api/compliance/checklists')
        .send({ projectId, checklistName: 'Unauth' })
        .expect(401);
    });
  });
  describe('GET /api/compliance/checklists', () => {
    beforeEach(async () => {
      await seedChecklist({
        checklistName: 'Safety Checklist',
        category: ComplianceCategory.SAFETY,
      });
      await seedChecklist({
        checklistName: 'Environmental Checklist',
        category: ComplianceCategory.ENVIRONMENTAL,
      });
    });
    it('should return all checklists for authenticated user', async () => {
      const response = await request(app)
        .get('/api/compliance/checklists')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.total).toBe(2);
    });
    it('should filter by projectId', async () => {
      await seedChecklist({
        projectId: new mongoose.Types.ObjectId().toString(),
        checklistName: 'Other Project',
      });
      const response = await request(app)
        .get(`/api/compliance/checklists?projectId=${projectId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(2);
    });
    it('should filter by category', async () => {
      const response = await request(app)
        .get(`/api/compliance/checklists?category=${ComplianceCategory.SAFETY}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].checklistName).toBe('Safety Checklist');
    });
    it('should return 401 if not authenticated', async () => {
      await request(app).get('/api/compliance/checklists').expect(401);
    });
  });
  describe('GET /api/compliance/checklists/:id', () => {
    let checklistId: string;
    beforeEach(async () => {
      const checklist = await seedChecklist();
      checklistId = checklist._id.toString();
    });
    it('should return a checklist with populated items', async () => {
      const response = await request(app)
        .get(`/api/compliance/checklists/${checklistId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(2);
      expect(response.body.data).toHaveProperty('complianceScore');
    });
    it('should return 404 for non-existent checklist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/compliance/checklists/${fakeId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });
    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/compliance/checklists/not-valid')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(400);
    });
  });
  describe('PUT /api/compliance/checklists/:id', () => {
    let checklistId: string;
    beforeEach(async () => {
      const checklist = await seedChecklist();
      checklistId = checklist._id.toString();
    });
    it('should update checklist name and recalculate score when items change', async () => {
      const response = await request(app)
        .put(`/api/compliance/checklists/${checklistId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          checklistName: 'Updated Safety Checklist',
          items: [
            { itemId: 'item-1', itemName: 'Fire extinguishers installed', isCompleted: true },
            { itemId: 'item-2', itemName: 'Emergency exits marked', isCompleted: true },
          ],
        })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.checklistName).toBe('Updated Safety Checklist');
      expect(response.body.data.complianceScore).toBe(100);
      expect(response.body.data.completedItems).toBe(2);
    });
    it('should auto-set completedBy when marking item complete', async () => {
      const response = await request(app)
        .put(`/api/compliance/checklists/${checklistId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          items: [{ itemId: 'item-2', itemName: 'Emergency exits marked', isCompleted: true }],
        })
        .expect(200);
      expect(response.body.data.items[0].completedBy).toBeTruthy();
    });
    it('should return 404 for non-existent checklist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .put(`/api/compliance/checklists/${fakeId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ checklistName: 'Updated' })
        .expect(404);
    });
    it('should return 403 if VIEWER tries to update', async () => {
      await request(app)
        .put(`/api/compliance/checklists/${checklistId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ checklistName: 'Hacked' })
        .expect(403);
    });
  });
  describe('DELETE /api/compliance/checklists/:id', () => {
    let checklistId: string;
    beforeEach(async () => {
      const checklist = await seedChecklist();
      checklistId = checklist._id.toString();
    });
    it('should allow ADMIN to delete a checklist', async () => {
      const response = await request(app)
        .delete(`/api/compliance/checklists/${checklistId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Checklist deleted successfully');
      const deleted = await ComplianceChecklist.findById(checklistId);
      expect(deleted).toBeNull();
    });
    it('should deny PROJECT_MANAGER from deleting', async () => {
      await request(app)
        .delete(`/api/compliance/checklists/${checklistId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(403);
    });
    it('should return 404 for non-existent checklist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .delete(`/api/compliance/checklists/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
  describe('POST /api/compliance/inspections', () => {
    it('should create an inspection as INSPECTOR', async () => {
      const response = await request(app)
        .post('/api/compliance/inspections')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          projectId,
          inspectionType: InspectionType.SAFETY,
          inspectionDate: new Date().toISOString(),
          findings: 'Missing safety harnesses on level 3',
          riskLevel: RiskLevel.HIGH,
          issuesIdentified: [
            { issue: 'No harnesses', severity: IssueSeverity.MAJOR, location: 'Level 3' },
          ],
          actionRequired: 'Provide harnesses immediately',
          actionDeadline: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.findings).toBe('Missing safety harnesses on level 3');
      expect(response.body.data.riskLevel).toBe(RiskLevel.HIGH);
      expect(response.body.data.actionStatus).toBe(ActionStatus.PENDING);
      expect(response.body.data.isResolved).toBe(false);
      expect(response.body.data.inspector).toBeTruthy();
    });
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/compliance/inspections')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ projectId, findings: 'Some findings' })
        .expect(400);
      expect(response.body.error).toContain('required');
    });
    it('should return 400 for invalid projectId', async () => {
      const response = await request(app)
        .post('/api/compliance/inspections')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          projectId: 'not-valid',
          inspectionDate: new Date(),
          findings: 'Test',
          riskLevel: RiskLevel.LOW,
        })
        .expect(400);
      expect(response.body.error).toBe('Invalid projectId format');
    });
    it('should return 403 if PROJECT_MANAGER tries to create', async () => {
      await request(app)
        .post('/api/compliance/inspections')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          projectId,
          inspectionDate: new Date(),
          findings: 'Test',
          riskLevel: RiskLevel.LOW,
        })
        .expect(403);
    });
    it('should return 401 if not authenticated', async () => {
      await request(app).post('/api/compliance/inspections').send({}).expect(401);
    });
  });
  describe('GET /api/compliance/inspections', () => {
    beforeEach(async () => {
      await seedInspection({ riskLevel: RiskLevel.HIGH });
      await seedInspection({
        riskLevel: RiskLevel.LOW,
        actionStatus: ActionStatus.COMPLETED,
        isResolved: true,
      });
    });
    it('should return all inspections for authenticated user', async () => {
      const response = await request(app)
        .get('/api/compliance/inspections')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.total).toBe(2);
    });
    it('should filter by riskLevel', async () => {
      const response = await request(app)
        .get(`/api/compliance/inspections?riskLevel=${RiskLevel.HIGH}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].riskLevel).toBe(RiskLevel.HIGH);
    });
    it('should filter by isResolved', async () => {
      const response = await request(app)
        .get('/api/compliance/inspections?isResolved=false')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].isResolved).toBe(false);
    });
    it('should return 401 if not authenticated', async () => {
      await request(app).get('/api/compliance/inspections').expect(401);
    });
  });
  describe('GET /api/compliance/inspections/:id', () => {
    let inspectionId: string;
    beforeEach(async () => {
      const inspection = await seedInspection();
      inspectionId = inspection._id.toString();
    });
    it('should return an inspection by ID', async () => {
      const response = await request(app)
        .get(`/api/compliance/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.findings).toBe('Workers not wearing safety helmets on level 2');
      expect(response.body.data.issuesIdentified.length).toBe(1);
    });
    it('should return 404 for non-existent inspection', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/compliance/inspections/${fakeId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(404);
    });
    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/compliance/inspections/not-valid')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(400);
    });
  });
  describe('PUT /api/compliance/inspections/:id', () => {
    let inspectionId: string;
    beforeEach(async () => {
      const inspection = await seedInspection();
      inspectionId = inspection._id.toString();
    });
    it('should update inspection fields as INSPECTOR', async () => {
      const response = await request(app)
        .put(`/api/compliance/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ inspectorNotes: 'Revisited site, issue confirmed', riskLevel: RiskLevel.CRITICAL })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.inspectorNotes).toBe('Revisited site, issue confirmed');
      expect(response.body.data.riskLevel).toBe(RiskLevel.CRITICAL);
    });
    it('should auto-set isResolved when actionStatus is set to Completed', async () => {
      const response = await request(app)
        .put(`/api/compliance/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ actionStatus: ActionStatus.COMPLETED, followUpNotes: 'All helmets provided' })
        .expect(200);
      expect(response.body.data.actionStatus).toBe(ActionStatus.COMPLETED);
      expect(response.body.data.isResolved).toBe(true);
    });
    it('should return 404 for non-existent inspection', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .put(`/api/compliance/inspections/${fakeId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ riskLevel: RiskLevel.LOW })
        .expect(404);
    });
    it('should return 403 if PROJECT_MANAGER tries to update', async () => {
      await request(app)
        .put(`/api/compliance/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ riskLevel: RiskLevel.LOW })
        .expect(403);
    });
  });
  describe('DELETE /api/compliance/inspections/:id', () => {
    let inspectionId: string;
    beforeEach(async () => {
      const inspection = await seedInspection();
      inspectionId = inspection._id.toString();
    });
    it('should allow ADMIN to delete an inspection', async () => {
      const response = await request(app)
        .delete(`/api/compliance/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Inspection deleted successfully');
      const deleted = await SafetyInspection.findById(inspectionId);
      expect(deleted).toBeNull();
    });
    it('should deny INSPECTOR from deleting', async () => {
      await request(app)
        .delete(`/api/compliance/inspections/${inspectionId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .expect(403);
    });
    it('should return 404 for non-existent inspection', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .delete(`/api/compliance/inspections/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
  describe('PUT /api/compliance/checklists/:id/items/:itemId', () => {
    let checklistId: string;
    beforeEach(async () => {
      const checklist = await seedChecklist();
      checklistId = checklist._id.toString();
    });
    it('should mark item as completed and update compliance score', async () => {
      const response = await request(app)
        .put(`/api/compliance/checklists/${checklistId}/items/item-2`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ isCompleted: true })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.complianceScore).toBe(100);
    });
    it('should update item notes without changing completion status', async () => {
      const response = await request(app)
        .put(`/api/compliance/checklists/${checklistId}/items/item-1`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ notes: 'Verified on site' })
        .expect(200);
      expect(response.body.success).toBe(true);
      const item = response.body.data.items.find((i: { itemId: string }) => i.itemId === 'item-1');
      expect(item.notes).toBe('Verified on site');
    });
    it('should return 404 for non-existent item', async () => {
      await request(app)
        .put(`/api/compliance/checklists/${checklistId}/items/item-999`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ isCompleted: true })
        .expect(404);
    });
  });
  describe('GET /api/compliance/score/:projectId', () => {
    beforeEach(async () => {
      await seedChecklist();
      await ComplianceChecklist.create({
        projectId,
        checklistName: 'Environmental Checklist',
        category: ComplianceCategory.ENVIRONMENTAL,
        items: [
          { itemId: 'env-1', itemName: 'Waste disposal plan', isCompleted: true },
          { itemId: 'env-2', itemName: 'Noise monitoring', isCompleted: true },
        ],
      });
    });
    it('should return aggregated compliance score across all checklists', async () => {
      const response = await request(app)
        .get(`/api/compliance/score/${projectId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalChecklists).toBe(2);
      expect(response.body.data.overallScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.breakdown).toBeInstanceOf(Array);
      expect(response.body.data.breakdown.length).toBe(2);
    });
    it('should return zero score for project with no checklists', async () => {
      const emptyProj = await Project.create({
        projectName: 'Empty Project',
        location: { address: '0 Empty St' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 1000,
        projectManager: pmId,
        createdBy: adminId,
      });
      const response = await request(app)
        .get(`/api/compliance/score/${emptyProj._id}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
      expect(response.body.data.overallScore).toBe(0);
      expect(response.body.data.totalChecklists).toBe(0);
    });
  });
});
