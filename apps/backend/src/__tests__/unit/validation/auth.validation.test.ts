import { registerSchema, loginSchema } from '../../../validation/auth.validation';
import { UserRole } from '../../../types';

describe('Auth Validation Schemas', () => {
  describe('Register Schema', () => {
    const validData = {
      fullName: 'John Silva',
      email: 'john@example.com',
      password: 'SecurePass123',
      role: UserRole.PROJECT_MANAGER,
      phoneNumber: '+94771234567',
    };

    it('should validate correct registration data', () => {
      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    describe('Full Name Validation', () => {
      it('should fail with fullName shorter than 2 characters', () => {
        const { error } = registerSchema.validate({
          ...validData,
          fullName: 'A',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('at least 2 characters');
      });

      it('should fail with fullName longer than 100 characters', () => {
        const { error } = registerSchema.validate({
          ...validData,
          fullName: 'A'.repeat(101),
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('cannot exceed 100 characters');
      });

      it('should fail without fullName', () => {
        const { error } = registerSchema.validate({
          ...validData,
          fullName: undefined,
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('required');
      });
    });

    describe('Email Validation', () => {
      it('should fail with invalid email format', () => {
        const { error } = registerSchema.validate({
          ...validData,
          email: 'invalid-email',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('valid email');
      });

      it('should fail without email', () => {
        const { error } = registerSchema.validate({
          ...validData,
          email: undefined,
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('required');
      });

      it('should convert email to lowercase', () => {
        const { value } = registerSchema.validate({
          ...validData,
          email: 'TEST@EXAMPLE.COM',
        });
        expect(value.email).toBe('test@example.com');
      });

      it('should accept valid email formats', () => {
        const validEmails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'user123@test-domain.com',
        ];

        validEmails.forEach((email) => {
          const { error } = registerSchema.validate({
            ...validData,
            email,
          });
          expect(error).toBeUndefined();
        });
      });
    });

    describe('Password Validation', () => {
      it('should fail with password shorter than 8 characters', () => {
        const { error } = registerSchema.validate({
          ...validData,
          password: 'Short1',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('at least 8 characters');
      });

      it('should fail without uppercase letter', () => {
        const { error } = registerSchema.validate({
          ...validData,
          password: 'lowercase123',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('uppercase');
      });

      it('should fail without lowercase letter', () => {
        const { error } = registerSchema.validate({
          ...validData,
          password: 'UPPERCASE123',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('lowercase');
      });

      it('should fail without number', () => {
        const { error } = registerSchema.validate({
          ...validData,
          password: 'NoNumbersHere',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('number');
      });

      it('should fail without password', () => {
        const { error } = registerSchema.validate({
          ...validData,
          password: undefined,
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('required');
      });

      it('should accept strong passwords', () => {
        const strongPasswords = [
          'SecurePass123',
          'MyP@ssw0rd',
          'Test1234Pass',
          'Abcd1234',
        ];

        strongPasswords.forEach((password) => {
          const { error } = registerSchema.validate({
            ...validData,
            password,
          });
          expect(error).toBeUndefined();
        });
      });
    });

    describe('Role Validation', () => {
      it('should accept valid roles', () => {
        const validRoles = [
          UserRole.ADMIN,
          UserRole.PROJECT_MANAGER,
          UserRole.INSPECTOR,
          UserRole.SUPPLIER,
          UserRole.VIEWER,
        ];

        validRoles.forEach((role) => {
          const { error } = registerSchema.validate({
            ...validData,
            role,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should fail with invalid role', () => {
        const { error } = registerSchema.validate({
          ...validData,
          role: 'INVALID_ROLE',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('must be one of');
      });

      it('should fail without role', () => {
        const { error } = registerSchema.validate({
          ...validData,
          role: undefined,
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('required');
      });
    });

    describe('Phone Number Validation', () => {
      it('should accept valid E.164 phone numbers', () => {
        const validPhones = [
          '+94771234567',
          '+1234567890',
          '+442071234567',
          '+61412345678',
        ];

        validPhones.forEach((phoneNumber) => {
          const { error } = registerSchema.validate({
            ...validData,
            phoneNumber,
          });
          expect(error).toBeUndefined();
        });
      });

      it('should fail with invalid phone format', () => {
        const invalidPhones = [
          '1234567890', // Missing +
          '+12', // Too short
          'abc123', // Contains letters
          '+1-234-567-8900', // Contains dashes
        ];

        invalidPhones.forEach((phoneNumber) => {
          const { error } = registerSchema.validate({
            ...validData,
            phoneNumber,
          });
          expect(error).toBeDefined();
        });
      });

      it('should allow phoneNumber to be optional', () => {
        const { error } = registerSchema.validate({
          fullName: validData.fullName,
          email: validData.email,
          password: validData.password,
          role: validData.role,
        });
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Login Schema', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'TestPass123',
    };

    it('should validate correct login data', () => {
      const { error } = loginSchema.validate(validLoginData);
      expect(error).toBeUndefined();
    });

    describe('Email Validation', () => {
      it('should fail with invalid email format', () => {
        const { error } = loginSchema.validate({
          ...validLoginData,
          email: 'invalid-email',
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('valid email');
      });

      it('should fail without email', () => {
        const { error } = loginSchema.validate({
          password: validLoginData.password,
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('required');
      });
    });

    describe('Password Validation', () => {
      it('should fail without password', () => {
        const { error } = loginSchema.validate({
          email: validLoginData.email,
        });
        expect(error).toBeDefined();
        expect(error?.message).toContain('required');
      });

      it('should accept any password format for login', () => {
        // Login doesn't enforce password strength
        const passwords = ['weak', 'short', 'NoNumber', 'UPPERCASE'];

        passwords.forEach((password) => {
          const { error } = loginSchema.validate({
            ...validLoginData,
            password,
          });
          expect(error).toBeUndefined();
        });
      });
    });
  });
});
