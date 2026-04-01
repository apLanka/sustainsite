import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app';
import User from '../../models/User';
import { UserRole } from '../../types';
import { createTestUser, getAuthToken } from '../helpers/testHelpers';
describe('User Management API (/api/users)', () => {
    let adminToken: string;
    let pmToken: string;
    let adminId: string;
    let pmId: string;
    beforeEach(async () => {
        const admin = await createTestUser({ email: 'user-admin@test.com', role: UserRole.ADMIN });
        const pm = await createTestUser({ email: 'user-pm@test.com', role: UserRole.PROJECT_MANAGER });
        adminId = admin._id.toString();
        pmId = pm._id.toString();
        adminToken = getAuthToken(adminId, admin.email, admin.role);
        pmToken = getAuthToken(pmId, pm.email, pm.role);
    });
    describe('GET /api/users', () => {
        it('should return paginated user list for ADMIN', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
        });
        it('should deny non-ADMIN access', async () => {
            await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${pmToken}`)
                .expect(403);
        });
        it('should filter by role', async () => {
            const response = await request(app)
                .get(`/api/users?role=${UserRole.PROJECT_MANAGER}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.data.every((u: {
                role: string;
            }) => u.role === UserRole.PROJECT_MANAGER)).toBe(true);
        });
        it('should search by name', async () => {
            const response = await request(app)
                .get('/api/users?search=user-pm')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });
    describe('GET /api/users/:id', () => {
        it('should return a user by ID for ADMIN', async () => {
            const response = await request(app)
                .get(`/api/users/${pmId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(pmId);
            expect(response.body.data.password).toBeUndefined();
        });
        it('should return 404 for non-existent user', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            await request(app)
                .get(`/api/users/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });
    describe('PATCH /api/users/:id', () => {
        it('should allow ADMIN to deactivate a user', async () => {
            const response = await request(app)
                .patch(`/api/users/${pmId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ isActive: false })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.isActive).toBe(false);
        });
        it('should allow ADMIN to change role', async () => {
            const response = await request(app)
                .patch(`/api/users/${pmId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: UserRole.INSPECTOR })
                .expect(200);
            expect(response.body.data.role).toBe(UserRole.INSPECTOR);
        });
        it('should prevent ADMIN from changing their own role', async () => {
            await request(app)
                .patch(`/api/users/${adminId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: UserRole.VIEWER })
                .expect(400);
        });
        it('should deny non-ADMIN from updating users', async () => {
            await request(app)
                .patch(`/api/users/${pmId}`)
                .set('Authorization', `Bearer ${pmToken}`)
                .send({ isActive: false })
                .expect(403);
        });
    });
    describe('DELETE /api/users/:id (soft-delete)', () => {
        it('should soft-delete (deactivate) a user', async () => {
            const response = await request(app)
                .delete(`/api/users/${pmId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            const user = await User.findById(pmId);
            expect(user?.isActive).toBe(false);
        });
        it('should prevent ADMIN from deactivating themselves', async () => {
            await request(app)
                .delete(`/api/users/${adminId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(400);
        });
    });
});
