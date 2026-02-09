import User from '../../../models/User';
import { UserRole } from '../../../types';
import { createTestUser } from '../../helpers/testHelpers';

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'PlainPassword123',
        role: UserRole.VIEWER,
      });

      expect(user.password).not.toBe('PlainPassword123');
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const user = await createTestUser({ password: 'TestPass123' });
      const originalHash = user.password;

      // Update user without changing password
      user.fullName = 'Updated Name';
      await user.save();

      expect(user.password).toBe(originalHash);
    });

    it('should rehash password when modified', async () => {
      const user = await createTestUser({ password: 'OldPass123' });
      const originalHash = user.password;

      // Change password
      user.password = 'NewPass123';
      await user.save();

      expect(user.password).not.toBe(originalHash);
      expect(user.password).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('comparePassword Method', () => {
    it('should return true for correct password', async () => {
      const user = await createTestUser({ password: 'TestPass123' });
      const isValid = await user.comparePassword('TestPass123');
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await createTestUser({ password: 'TestPass123' });
      const isValid = await user.comparePassword('WrongPass123');
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const user = await createTestUser({ password: 'TestPass123' });
      const isValid = await user.comparePassword('');
      expect(isValid).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should create user with valid data', async () => {
      const user = await User.create({
        fullName: 'John Silva',
        email: 'john@example.com',
        password: 'SecurePass123',
        role: UserRole.PROJECT_MANAGER,
        phoneNumber: '+94771234567',
      });

      expect(user.fullName).toBe('John Silva');
      expect(user.email).toBe('john@example.com');
      expect(user.role).toBe(UserRole.PROJECT_MANAGER);
      expect(user.phoneNumber).toBe('+94771234567');
      expect(user.isActive).toBe(true);
    });

    it('should fail without required fullName', async () => {
      await expect(
        User.create({
          email: 'test@example.com',
          password: 'TestPass123',
          role: UserRole.VIEWER,
        })
      ).rejects.toThrow();
    });

    it('should fail without required email', async () => {
      await expect(
        User.create({
          fullName: 'Test User',
          password: 'TestPass123',
          role: UserRole.VIEWER,
        })
      ).rejects.toThrow();
    });

    it('should fail without required password', async () => {
      await expect(
        User.create({
          fullName: 'Test User',
          email: 'test@example.com',
          role: UserRole.VIEWER,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid email format', async () => {
      await expect(
        User.create({
          fullName: 'Test User',
          email: 'invalid-email',
          password: 'TestPass123',
          role: UserRole.VIEWER,
        })
      ).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      await expect(
        User.create({
          fullName: 'Another User',
          email: 'duplicate@example.com',
          password: 'TestPass123',
          role: UserRole.VIEWER,
        })
      ).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'TestPass123',
        role: UserRole.VIEWER,
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should fail with password shorter than 8 characters', async () => {
      await expect(
        User.create({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Short1',
          role: UserRole.VIEWER,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid phone number format', async () => {
      await expect(
        User.create({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123',
          role: UserRole.VIEWER,
          phoneNumber: 'invalid-phone',
        })
      ).rejects.toThrow();
    });

    it('should accept valid phone number', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123',
        role: UserRole.VIEWER,
        phoneNumber: '+94771234567',
      });

      expect(user.phoneNumber).toBe('+94771234567');
    });

    it('should set default role to VIEWER', async () => {
      const user = await User.create({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123',
      });

      expect(user.role).toBe(UserRole.VIEWER);
    });

    it('should set default isActive to true', async () => {
      const user = await createTestUser();
      expect(user.isActive).toBe(true);
    });
  });

  describe('toJSON Method', () => {
    it('should exclude password from JSON output', async () => {
      const user = await createTestUser({ password: 'TestPass123' });
      const userJSON = user.toJSON();

      expect(userJSON).not.toHaveProperty('password');
      expect(userJSON).toHaveProperty('email');
      expect(userJSON).toHaveProperty('fullName');
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const user = await createTestUser();

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when user is modified', async () => {
      const user = await createTestUser();
      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.fullName = 'Updated Name';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('User Roles', () => {
    it('should accept ADMIN role', async () => {
      const user = await createTestUser({ role: UserRole.ADMIN });
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('should accept PROJECT_MANAGER role', async () => {
      const user = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      expect(user.role).toBe(UserRole.PROJECT_MANAGER);
    });

    it('should accept INSPECTOR role', async () => {
      const user = await createTestUser({ role: UserRole.INSPECTOR });
      expect(user.role).toBe(UserRole.INSPECTOR);
    });

    it('should accept SUPPLIER role', async () => {
      const user = await createTestUser({ role: UserRole.SUPPLIER });
      expect(user.role).toBe(UserRole.SUPPLIER);
    });

    it('should accept VIEWER role', async () => {
      const user = await createTestUser({ role: UserRole.VIEWER });
      expect(user.role).toBe(UserRole.VIEWER);
    });
  });
});
