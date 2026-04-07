import request from 'supertest';
import app from '../../app';
import SustainabilityMetric from '../../models/SustainabilityMetric';
import Project from '../../models/Project';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';
import mongoose from 'mongoose';
describe('Sustainability Monitoring API', () => {
  let adminToken: string;
  let pmToken: string;
  let viewerToken: string;
  let adminId: string;
  let pmId: string;
  let projectId: string;
  beforeEach(async () => {
    const admin = await createTestUser({ email: 'sui-admin@test.com', role: UserRole.ADMIN });
    const pm = await createTestUser({ email: 'sui-pm@test.com', role: UserRole.PROJECT_MANAGER });
    const viewer = await createTestUser({ email: 'sui-viewer@test.com', role: UserRole.VIEWER });
    adminId = admin._id.toString();
    pmId = pm._id.toString();
    adminToken = getAuthToken(adminId, admin.email, admin.role);
    pmToken = getAuthToken(pmId, pm.email, pm.role);
    viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);
    await Project.deleteMany({});
    await SustainabilityMetric.deleteMany({});
    const proj = await Project.create({
      projectName: 'Green Base Project',
      location: { address: 'Address 1' },
      startDate: new Date(),
      endDate: new Date(),
      budget: 500000,
      projectManager: pmId,
      createdBy: adminId,
      teamMembers: [pmId],
    });
    projectId = proj._id.toString();
  });
  const validMetricData = {
    carbonEmissions: {
      transportation: 1.5,
      equipment: 2.0,
      materials: 3.5,
    },
    energyConsumption: {
      electricity: 1000,
      diesel: 500,
      renewableEnergy: 200,
    },
    wasteManagement: {
      recyclable: 500,
      nonRecyclable: 100,
      hazardous: 20,
    },
    waterUsage: {
      municipal: 5000,
      recycled: 1000,
    },
    recordedDate: new Date().toISOString(),
    notes: 'Test note',
  };
  describe('POST /api/sustainability', () => {
    it('should create a sustainability metric and update project score', async () => {
      const response = await request(app)
        .post('/api/sustainability')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ ...validMetricData, projectId })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.projectId).toBe(projectId);
      expect(response.body.data.sustainabilityScore).toBeGreaterThan(0);
      const updatedProject = await Project.findById(projectId);
      expect(updatedProject?.sustainabilityScore).toBe(response.body.data.sustainabilityScore);
    });
  });
  describe('GET /api/sustainability/projects/:projectId/metrics', () => {
    beforeEach(async () => {
      await SustainabilityMetric.create({ ...validMetricData, projectId, recordedBy: pmId });
    });
    it('should fetch metrics for a project', async () => {
      const response = await request(app)
        .get(`/api/sustainability/projects/${projectId}/metrics`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
    it('should block non-members from viewing project metrics', async () => {
      await request(app)
        .get(`/api/sustainability/projects/${projectId}/metrics`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });
  describe('GET /api/sustainability/projects/:projectId/score (enriched)', () => {
    beforeEach(async () => {
      await Project.findByIdAndUpdate(projectId, { sustainabilityScore: 85 });
      await SustainabilityMetric.create({ ...validMetricData, projectId, recordedBy: pmId });
    });
    it('should return enriched score with trend, breakdown, and recommendations', async () => {
      const response = await request(app)
        .get(`/api/sustainability/projects/${projectId}/score`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.currentScore).toBe(85);
      expect(response.body.data.scoreCategory).toBe('Green');
      expect(response.body.data.trend).toBeDefined();
      expect(response.body.data.benchmarkComparison).toBeDefined();
      expect(response.body.data.recommendations).toBeInstanceOf(Array);
    });
  });
  describe('POST /api/sustainability/calculate-impact', () => {
    it('should calculate experimental impact metrics safely without saving', async () => {
      const response = await request(app)
        .post('/api/sustainability/calculate-impact')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          carbonEmissions: { transportation: 2, equipment: 2, materials: 2 },
          energyConsumption: { electricity: 100, renewableEnergy: 100 },
        })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCarbon).toBe(6);
      expect(response.body.data.treesEquivalent).toBe(Math.round(6 * 54.4));
      expect(response.body.data.renewablePercentage).toBe(50);
    });
  });
  describe('GET /api/sustainability', () => {
    beforeEach(async () => {
      await SustainabilityMetric.create({ ...validMetricData, projectId, recordedBy: pmId });
      await SustainabilityMetric.create({ ...validMetricData, projectId, recordedBy: pmId });
    });
    it('should return all metrics with pagination', async () => {
      const response = await request(app)
        .get('/api/sustainability')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });
  });
  describe('GET /api/sustainability/:id', () => {
    let metricId: string;
    beforeEach(async () => {
      const metric = await SustainabilityMetric.create({
        ...validMetricData,
        projectId,
        recordedBy: pmId,
      });
      metricId = metric._id.toString();
    });
    it('should return a single metric by ID', async () => {
      const response = await request(app)
        .get(`/api/sustainability/${metricId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe('Test note');
    });
  });
  describe('PUT /api/sustainability/:id', () => {
    let metricId: string;
    beforeEach(async () => {
      const metric = await SustainabilityMetric.create({
        ...validMetricData,
        projectId,
        recordedBy: pmId,
      });
      metricId = metric._id.toString();
    });
    it('should update a metric and recalculate score/trees', async () => {
      const response = await request(app)
        .put(`/api/sustainability/${metricId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Updated note' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe('Updated note');
    });
  });
  describe('DELETE /api/sustainability/:id', () => {
    let metricId: string;
    beforeEach(async () => {
      const metric = await SustainabilityMetric.create({
        ...validMetricData,
        projectId,
        recordedBy: pmId,
      });
      metricId = metric._id.toString();
    });
    it('should allow ADMIN to delete metric', async () => {
      const response = await request(app)
        .delete(`/api/sustainability/${metricId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
    });
  });
  describe('GET /api/sustainability/projects/:projectId/metrics/latest', () => {
    beforeEach(async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      await SustainabilityMetric.create({
        ...validMetricData,
        projectId,
        recordedDate: pastDate,
        notes: 'Old',
      });
      await SustainabilityMetric.create({
        ...validMetricData,
        projectId,
        recordedDate: new Date(),
        notes: 'Latest',
      });
    });
    it('should fetch only the most recent metric for a project', async () => {
      const response = await request(app)
        .get(`/api/sustainability/projects/${projectId}/metrics/latest`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe('Latest');
    });
  });
  describe('GET /api/sustainability/projects/:projectId/trends (aggregated)', () => {
    beforeEach(async () => {
      await SustainabilityMetric.create({ ...validMetricData, projectId, recordedBy: pmId });
      await SustainabilityMetric.create({ ...validMetricData, projectId, recordedBy: pmId });
    });
    it('should return aggregated trends with summary', async () => {
      const response = await request(app)
        .get(`/api/sustainability/projects/${projectId}/trends?period=30&interval=weekly`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trends).toBeInstanceOf(Array);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary).toHaveProperty('averageScore');
      expect(response.body.data.summary).toHaveProperty('scoreImprovement');
    });
  });
  describe('GET /api/sustainability/projects/:projectId/compare', () => {
    beforeEach(async () => {
      await Project.findByIdAndUpdate(projectId, { sustainabilityScore: 72 });
      await SustainabilityMetric.create({ ...validMetricData, projectId, recordedBy: pmId });
    });
    it('should return industry comparison data', async () => {
      const response = await request(app)
        .get(`/api/sustainability/projects/${projectId}/compare`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.projectScore).toBe(72);
      expect(response.body.data.industryAverage).toBe(65);
      expect(response.body.data.difference).toBe(7);
      expect(response.body.data.percentileBand).toBeDefined();
      expect(response.body.data.areasAboveAverage).toBeInstanceOf(Array);
      expect(response.body.data.areasBelowAverage).toBeInstanceOf(Array);
    });
  });
  describe('POST /api/sustainability/metrics (alias)', () => {
    it('should create metric via /metrics alias', async () => {
      const response = await request(app)
        .post('/api/sustainability/metrics')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ ...validMetricData, projectId })
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.projectId).toBe(projectId);
    });
  });
});
