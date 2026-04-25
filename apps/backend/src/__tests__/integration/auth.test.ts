import request from 'supertest';
import app from '../../app';
import User from '../../models/User';
import { UserRole } from '../../types';
import {
  createTestUser,
  getAuthToken,
  validRegistrationData,
  testUsers,
} from '../helpers/testHelpers';
describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data.email).toBe(validRegistrationData.email);
      expect(response.body.data.fullName).toBe(validRegistrationData.fullName);
      expect(response.body.data.role).toBe(validRegistrationData.role);
      expect(response.body.data).not.toHaveProperty('password');
    });
    it('should hash password in database', async () => {
      await request(app).post('/api/auth/register').send(validRegistrationData).expect(201);
      const user = await User.findOne({ email: validRegistrationData.email }).select('+password');
      expect(user?.password).not.toBe(validRegistrationData.password);
      expect(user?.password).toMatch(/^\$2[aby]\$/);
    });
    it('should return 409 for duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'duplicate@example.com',
        })
        .expect(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'invalid-email',
        })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          password: 'weak',
        })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          role: 'INVALID_ROLE',
        })
        .expect(400);
      expect(response.body.success).toBe(false);
    });
  });
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'LoginPass123',
      });
    });
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'LoginPass123',
        })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data.email).toBe('login@example.com');
      expect(response.body.data).toHaveProperty('expiresIn');
      expect(response.body.data).not.toHaveProperty('password');
    });
    it('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'LoginPass123',
        })
        .expect(200);
      const token = response.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'LoginPass123',
        })
        .expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword123',
        })
        .expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
    it('should return 401 for inactive user', async () => {
      await createTestUser({
        email: 'inactive@example.com',
        password: 'InactivePass123',
        isActive: false,
      });
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'InactivePass123',
        })
        .expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('deactivated');
    });
    it('should update lastLogin timestamp', async () => {
      const userBefore = await User.findOne({ email: 'login@example.com' });
      const lastLoginBefore = userBefore?.lastLogin;
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'LoginPass123',
        })
        .expect(200);
      const userAfter = await User.findOne({ email: 'login@example.com' });
      expect(userAfter?.lastLogin).toBeDefined();
      expect(userAfter?.lastLogin).not.toBe(lastLoginBefore);
    });
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'LoginPass123',
        })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
        })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
  });
  describe('GET /api/auth/me', () => {
    let testUser: any;
    let authToken: string;
    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'me@example.com',
        password: 'MePass123',
        role: UserRole.PROJECT_MANAGER,
      });
      authToken = getAuthToken(testUser._id.toString(), testUser.email, testUser.role);
    });
    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data.email).toBe('me@example.com');
      expect(response.body.data.role).toBe(UserRole.PROJECT_MANAGER);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).not.toHaveProperty('password');
    });
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No token provided');
    });
    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid token');
    });
    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
      expect(response.body.success).toBe(false);
    });
    it('should return 404 if user not found', async () => {
      await User.findByIdAndDelete(testUser._id);
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
    it('should include assignedProjects in response', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(response.body.data).toHaveProperty('assignedProjects');
      expect(Array.isArray(response.body.data.assignedProjects)).toBe(true);
    });
  });
  describe('Edge Cases', () => {
    it('should handle concurrent registrations with same email', async () => {
      const registrationData = {
        ...validRegistrationData,
        email: 'concurrent@example.com',
      };
      const [response1, response2] = await Promise.all([
        request(app).post('/api/auth/register').send(registrationData),
        request(app).post('/api/auth/register').send(registrationData),
      ]);
      const statuses = [response1.status, response2.status].sort();
      expect(statuses).toEqual([201, 409]);
    });
    it('should handle very long input strings', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          fullName: 'A'.repeat(200),
        })
        .expect(400);
      expect(response.body.success).toBe(false);
    });
    it('should handle special characters in password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'special@example.com',
          password: 'P@ssw0rd!#$%',
        })
        .expect(201);
      expect(response.body.success).toBe(true);
    });
    it('should sanitize email input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: '  TEST@EXAMPLE.COM  ',
        })
        .expect(201);
      expect(response.body.data.email).toBe('test@example.com');
    });
    it('should handle empty request body', async () => {
      const response = await request(app).post('/api/auth/register').send({}).expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
  });
  describe('Different User Roles', () => {
    it('should register ADMIN user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUsers.admin, email: 'admin-test@example.com' })
        .expect(201);
      expect(response.body.data.role).toBe(UserRole.ADMIN);
    });
    it('should register PROJECT_MANAGER user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUsers.projectManager, email: 'pm-test@example.com' })
        .expect(201);
      expect(response.body.data.role).toBe(UserRole.PROJECT_MANAGER);
    });
    it('should register INSPECTOR user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUsers.inspector, email: 'inspector-test@example.com' })
        .expect(201);
      expect(response.body.data.role).toBe(UserRole.INSPECTOR);
    });
    it('should register SUPPLIER user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUsers.supplier, email: 'supplier-test@example.com' })
        .expect(201);
      expect(response.body.data.role).toBe(UserRole.SUPPLIER);
    });
    it('should register VIEWER user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUsers.viewer, email: 'viewer-test@example.com' })
        .expect(201);
      expect(response.body.data.role).toBe(UserRole.VIEWER);
    });
  });
});
