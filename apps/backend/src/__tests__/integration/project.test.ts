import request from 'supertest';
import app from '../../app';
import Project, { ProjectStatus } from '../../models/Project';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';
import mongoose from 'mongoose';

describe('Project Management API', () => {
  let adminToken: string;
  let pmToken: string;
  let viewerToken: string;
  let adminId: string;
  let pmId: string;

  beforeEach(async () => {
    const admin = await createTestUser({ email: 'admin@test.com', role: UserRole.ADMIN });
    const pm = await createTestUser({ email: 'pm@test.com', role: UserRole.PROJECT_MANAGER });
    const viewer = await createTestUser({ email: 'viewer@test.com', role: UserRole.VIEWER });

    adminId = admin._id.toString();
    pmId = pm._id.toString();

    adminToken = getAuthToken(adminId, admin.email, admin.role);
    pmToken = getAuthToken(pmId, pm.email, pm.role);
    viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);

    await Project.deleteMany({});
  });

  describe('POST /api/projects', () => {
    const validProjectData = {
      projectName: 'Test Project',
      description: 'A test project',
      location: {
        address: '123 Test St',
        latitude: 6.9271,
        longitude: 79.8612,
      },
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      budget: 100000,
      projectManager: '',
    };

    it('should create a project successfully when ADMIN', async () => {
      validProjectData.projectManager = pmId;

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProjectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectName).toBe(validProjectData.projectName);
      expect(response.body.data.createdBy.toString()).toBe(adminId);
    });

    it('should deny project creation for VIEWER', async () => {
      validProjectData.projectManager = pmId;

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(validProjectData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      await Project.create({
        projectName: 'Test Project 1',
        location: { address: 'Address 1' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 50000,
        projectManager: pmId,
        createdBy: adminId,
      });

      await Project.create({
        projectName: 'Test Project 2',
        location: { address: 'Address 2' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 75000,
        projectManager: pmId,
        createdBy: adminId,
        status: ProjectStatus.IN_PROGRESS,
      });
    });

    it('should get all projects for authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/projects?status=In Progress')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].projectName).toBe('Test Project 2');
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const proj = await Project.create({
        projectName: 'Single Project',
        location: { address: 'Address 1' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 50000,
        projectManager: pmId,
        createdBy: adminId,
        teamMembers: [adminId, pmId] // Include pmId so they can view
      });
      projectId = proj._id.toString();
    });

    it('should get project details by id', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectName).toBe('Single Project');
    });

    it('should return 404 for invalid id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/projects/${fakeId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const proj = await Project.create({
        projectName: 'Update Project',
        location: { address: 'Address 1' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 50000,
        projectManager: pmId,
        createdBy: adminId,
      });
      projectId = proj._id.toString();
    });

    it('should allow PM to update project', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ projectName: 'Updated Project Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projectName).toBe('Updated Project Name');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId: string;

    beforeEach(async () => {
      const proj = await Project.create({
        projectName: 'Delete Project',
        location: { address: 'Address 1' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 50000,
        projectManager: pmId,
        createdBy: adminId,
      });
      projectId = proj._id.toString();
    });

    it('should allow ADMIN to delete project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny VIEWER to delete project', async () => {
      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });

  describe('POST /api/projects/:id/milestones', () => {
    let projectId: string;

    beforeEach(async () => {
      const proj = await Project.create({
        projectName: 'Milestone Project',
        location: { address: 'Address 1' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 50000,
        projectManager: pmId,
        createdBy: adminId,
      });
      projectId = proj._id.toString();
    });

    it('should allow PM to add milestone', async () => {
      const milestoneData = {
        title: 'Phase 1',
        description: 'First phase of project',
        targetDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'Pending',
      };

      const response = await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send(milestoneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Phase 1');
      expect(response.body.data.projectId).toBe(projectId);
    });
  });

  describe('PUT /api/projects/:id/milestones/:milestoneId', () => {
    let projectId: string;
    let milestoneId: string;

    beforeEach(async () => {
      const proj = await Project.create({
        projectName: 'Milestone Update Project',
        location: { address: 'Address 1' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 50000,
        projectManager: pmId,
        createdBy: adminId,
      });
      projectId = proj._id.toString();

      const res = await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          title: 'Initial Phase',
          targetDate: new Date(Date.now() + 86400000).toISOString(),
        });
      milestoneId = res.body.data._id;
    });

    it('should allow PM to update milestone', async () => {
      const response = await request(app)
        .put(`/api/projects/${projectId}/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'Completed', completionPercentage: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Completed');
    });
  });

  describe('GET /api/projects/:id/timeline', () => {
    let projectId: string;

    beforeEach(async () => {
      const proj = await Project.create({
        projectName: 'Timeline Project',
        location: { address: 'Address 1' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 50000,
        projectManager: pmId,
        createdBy: adminId,
        teamMembers: [adminId, pmId]
      });
      projectId = proj._id.toString();

      await request(app)
        .post(`/api/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          title: 'Timeline Phase 1',
          targetDate: new Date(Date.now() + 86400000).toISOString(),
        });
    });

    it('should return project timeline data', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}/timeline`)
        .set('Authorization', `Bearer ${pmToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('project');
      expect(response.body.data).toHaveProperty('milestones');
      expect(response.body.data.milestones.length).toBe(1);
    });
  });
});
