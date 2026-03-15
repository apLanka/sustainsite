import Project, { IProject, ProjectStatus } from '../../../models/Project';
import { UserRole } from '../../../types';
import { createTestUser, createTestProject } from '../../helpers/testHelpers';

describe('Project Model', () => {
  describe('Schema Validation', () => {
    it('should create project with valid data', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      const project = await Project.create({
        projectName: 'Build Green Office',
        location: { address: '123 Main St, Colombo' },
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: ProjectStatus.PLANNING,
        budget: 500000,
        actualCost: 0,
        projectManager: manager._id,
        sustainabilityScore: 85,
        completionPercentage: 0,
        createdBy: manager._id,
      });

      expect(project.projectName).toBe('Build Green Office');
      expect(project.status).toBe(ProjectStatus.PLANNING);
      expect(project.budget).toBe(500000);
      expect(project.sustainabilityScore).toBe(85);
    });

    it('should fail without projectName', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with projectName shorter than 3 characters', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'AB',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with projectName longer than 200 characters', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'A'.repeat(201),
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without location', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without startDate', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without endDate', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without budget', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative budget', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: -1000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail without projectManager', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          status: 'INVALID_STATUS' as ProjectStatus,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with sustainabilityScore below 0', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          sustainabilityScore: -1,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with sustainabilityScore above 100', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          sustainabilityScore: 101,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with completionPercentage below 0', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          completionPercentage: -1,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with completionPercentage above 100', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St' },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          completionPercentage: 101,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid latitude (below -90)', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St', latitude: -91 },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid latitude (above 90)', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St', latitude: 91 },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid longitude (below -180)', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St', longitude: -181 },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid longitude (above 180)', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      await expect(
        Project.create({
          projectName: 'Test Project',
          location: { address: '123 Main St', longitude: 181 },
          startDate: new Date(),
          endDate: new Date(),
          budget: 100000,
          projectManager: manager._id,
          createdBy: manager._id,
        })
      ).rejects.toThrow();
    });
  });

  describe('Project Status', () => {
    it('should accept PLANNING status', async () => {
      const project = await createTestProject({ status: ProjectStatus.PLANNING });
      expect(project.status).toBe(ProjectStatus.PLANNING);
    });

    it('should accept IN_PROGRESS status', async () => {
      const project = await createTestProject({ status: ProjectStatus.IN_PROGRESS });
      expect(project.status).toBe(ProjectStatus.IN_PROGRESS);
    });

    it('should accept ON_HOLD status', async () => {
      const project = await createTestProject({ status: ProjectStatus.ON_HOLD });
      expect(project.status).toBe(ProjectStatus.ON_HOLD);
    });

    it('should accept COMPLETED status', async () => {
      const project = await createTestProject({ status: ProjectStatus.COMPLETED });
      expect(project.status).toBe(ProjectStatus.COMPLETED);
    });

    it('should default to PLANNING status', async () => {
      const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
      const project = await Project.create({
        projectName: 'Default Status Test',
        location: { address: '123 Main St' },
        startDate: new Date(),
        endDate: new Date(),
        budget: 100000,
        projectManager: manager._id,
        createdBy: manager._id,
      });
      expect(project.status).toBe(ProjectStatus.PLANNING);
    });
  });

  describe('Virtual: daysRemaining', () => {
    it('should return 0 for completed projects', async () => {
      const futureEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const project = await createTestProject({
        status: ProjectStatus.COMPLETED,
        endDate: futureEndDate,
      });
      expect(project.daysRemaining).toBe(0);
    });

    it('should return correct days for future endDate', async () => {
      const futureEndDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const project = await createTestProject({
        endDate: futureEndDate,
      });
      expect(project.daysRemaining).toBeGreaterThanOrEqual(9);
      expect(project.daysRemaining).toBeLessThanOrEqual(10);
    });

    it('should return 0 for past endDate', async () => {
      const pastEndDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const project = await createTestProject({
        endDate: pastEndDate,
      });
      expect(project.daysRemaining).toBe(0);
    });
  });

  describe('Virtual: budgetVariance', () => {
    it('should calculate positive variance when under budget', async () => {
      const project = await createTestProject({
        budget: 100000,
        actualCost: 50000,
      });
      expect(project.budgetVariance).toBe(50000);
    });

    it('should calculate zero variance when on budget', async () => {
      const project = await createTestProject({
        budget: 100000,
        actualCost: 100000,
      });
      expect(project.budgetVariance).toBe(0);
    });

    it('should calculate negative variance when over budget', async () => {
      const project = await createTestProject({
        budget: 100000,
        actualCost: 120000,
      });
      expect(project.budgetVariance).toBe(-20000);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const project = await createTestProject();
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when project is modified', async () => {
      const project = await createTestProject();
      const originalUpdatedAt = project.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));
      project.projectName = 'Updated Project Name';
      await project.save();
      expect(project.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Defaults', () => {
    it('should set default actualCost to 0', async () => {
      const project = await createTestProject();
      expect(project.actualCost).toBe(0);
    });

    it('should set default sustainabilityScore to 0', async () => {
      const project = await createTestProject();
      expect(project.sustainabilityScore).toBe(0);
    });

    it('should set default completionPercentage to 0', async () => {
      const project = await createTestProject();
      expect(project.completionPercentage).toBe(0);
    });

    it('should set default teamMembers to empty array', async () => {
      const project = await createTestProject();
      expect(project.teamMembers).toEqual([]);
    });
  });

  describe('toJSON', () => {
    it('should include virtuals in JSON output', async () => {
      const project = await createTestProject({
        budget: 100000,
        actualCost: 50000,
      });
      const json = project.toJSON();
      expect(json).toHaveProperty('daysRemaining');
      expect(json).toHaveProperty('budgetVariance');
    });
  });
});