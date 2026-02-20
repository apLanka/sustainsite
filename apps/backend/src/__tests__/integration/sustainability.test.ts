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

      // Verify DB synced score to Project
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
      // Viewer is not in teamMembers array
      await request(app)
        .get(`/api/sustainability/projects/${projectId}/metrics`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });

  describe('GET /api/sustainability/projects/:projectId/score', () => {
    beforeEach(async () => {
      await Project.findByIdAndUpdate(projectId, { sustainabilityScore: 85 });
    });

    it('should fetch project sustainability score', async () => {
      const response = await request(app)
        .get(`/api/sustainability/projects/${projectId}/score`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sustainabilityScore).toBe(85);
    });
  });

  describe('POST /api/sustainability/calculate-impact', () => {
    it('should calculate experimental impact metrics safely without saving', async () => {
      const response = await request(app)
        .post('/api/sustainability/calculate-impact')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          carbonEmissions: { transportation: 2, equipment: 2, materials: 2 },
          energyConsumption: { electricity: 100, renewableEnergy: 100 }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCarbon).toBe(6);
      expect(response.body.data.treesEquivalent).toBe(Math.round(6 * 54.4));
      expect(response.body.data.renewablePercentage).toBe(50);
    });
  });
});
