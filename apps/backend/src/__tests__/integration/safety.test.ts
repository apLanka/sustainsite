import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import SafetyInspection, { RiskLevel, InspectionType, IssueSeverity, ActionStatus } from '../../models/SafetyInspection';
import Project from '../../models/Project';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';
jest.mock('../../config/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
    emailTemplates: {
        safetyInspection: jest.fn().mockReturnValue('<p>test</p>'),
    },
}));
describe('Safety Inspection API (/api/safety)', () => {
    let adminToken: string;
    let inspectorToken: string;
    let pmToken: string;
    let viewerToken: string;
    let adminId: string;
    let inspectorId: string;
    let pmId: string;
    let projectId: string;
    const validInspection = {
        inspectionType: InspectionType.ROUTINE,
        findings: 'Scaffolding not secured properly',
        riskLevel: RiskLevel.HIGH,
        issues: [
            {
                description: 'Loose scaffolding bolts',
                severity: IssueSeverity.HIGH,
                actionRequired: 'Tighten all bolts immediately',
                actionStatus: ActionStatus.OPEN,
            },
        ],
        inspectionDate: new Date().toISOString(),
    };
    beforeEach(async () => {
        const admin = await createTestUser({ email: 'safety-admin@test.com', role: UserRole.ADMIN });
        const inspector = await createTestUser({ email: 'safety-inspector@test.com', role: UserRole.INSPECTOR });
        const pm = await createTestUser({ email: 'safety-pm@test.com', role: UserRole.PROJECT_MANAGER });
        const viewer = await createTestUser({ email: 'safety-viewer@test.com', role: UserRole.VIEWER });
        adminId = admin._id.toString();
        inspectorId = inspector._id.toString();
        pmId = pm._id.toString();
        adminToken = getAuthToken(adminId, admin.email, admin.role);
        inspectorToken = getAuthToken(inspectorId, inspector.email, inspector.role);
        pmToken = getAuthToken(pmId, pm.email, pm.role);
        viewerToken = getAuthToken(viewer._id.toString(), viewer.email, viewer.role);
        await SafetyInspection.deleteMany({});
        await Project.deleteMany({});
        const proj = await Project.create({
            projectName: 'Safety Test Project',
            location: { address: '99 Safety Lane' },
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            budget: 200000,
            projectManager: pmId,
            createdBy: adminId,
        });
        projectId = proj._id.toString();
    });
    describe('POST /api/safety/inspection', () => {
        it('should allow INSPECTOR to create an inspection', async () => {
            const response = await request(app)
                .post('/api/safety/inspection')
                .set('Authorization', `Bearer ${inspectorToken}`)
                .send({ ...validInspection, projectId, inspector: inspectorId })
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.riskLevel).toBe(RiskLevel.HIGH);
        });
        it('should deny VIEWER from creating an inspection', async () => {
            await request(app)
                .post('/api/safety/inspection')
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({ ...validInspection, projectId, inspector: inspectorId })
                .expect(403);
        });
    });
    describe('GET /api/safety/:projectId', () => {
        beforeEach(async () => {
            await SafetyInspection.create({
                ...validInspection,
                projectId,
                inspector: inspectorId,
            });
        });
        it('should list inspections for a project', async () => {
            const response = await request(app)
                .get(`/api/safety/${projectId}`)
                .set('Authorization', `Bearer ${pmToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });
    describe('GET /api/safety/:projectId/high-risk', () => {
        beforeEach(async () => {
            await SafetyInspection.create([
                { ...validInspection, projectId, inspector: inspectorId, riskLevel: RiskLevel.HIGH, isResolved: false },
                { ...validInspection, projectId, inspector: inspectorId, riskLevel: RiskLevel.LOW, isResolved: false },
                { ...validInspection, projectId, inspector: inspectorId, riskLevel: RiskLevel.HIGH, isResolved: true },
            ]);
        });
        it('should return only unresolved High/Critical inspections', async () => {
            const response = await request(app)
                .get(`/api/safety/${projectId}/high-risk`)
                .set('Authorization', `Bearer ${pmToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].riskLevel).toBe(RiskLevel.HIGH);
            expect(response.body.data[0].isResolved).toBe(false);
        });
    });
    describe('GET /api/safety/inspection/:id', () => {
        let inspectionId: string;
        beforeEach(async () => {
            const insp = await SafetyInspection.create({
                ...validInspection,
                projectId,
                inspector: inspectorId,
            });
            inspectionId = insp._id.toString();
        });
        it('should return a single inspection by ID', async () => {
            const response = await request(app)
                .get(`/api/safety/inspection/${inspectionId}`)
                .set('Authorization', `Bearer ${viewerToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(inspectionId);
        });
        it('should return 404 for non-existent inspection', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            await request(app)
                .get(`/api/safety/inspection/${fakeId}`)
                .set('Authorization', `Bearer ${viewerToken}`)
                .expect(404);
        });
    });
    describe('PUT /api/safety/inspection/:id', () => {
        let inspectionId: string;
        beforeEach(async () => {
            const insp = await SafetyInspection.create({
                ...validInspection,
                projectId,
                inspector: inspectorId,
            });
            inspectionId = insp._id.toString();
        });
        it('should allow INSPECTOR to update an inspection', async () => {
            const response = await request(app)
                .put(`/api/safety/inspection/${inspectionId}`)
                .set('Authorization', `Bearer ${inspectorToken}`)
                .send({ isResolved: true })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isResolved).toBe(true);
        });
        it('should deny VIEWER from updating', async () => {
            await request(app)
                .put(`/api/safety/inspection/${inspectionId}`)
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({ isResolved: true })
                .expect(403);
        });
    });
});
