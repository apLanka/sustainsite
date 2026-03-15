import Milestone, { IMilestone, MilestoneStatus } from '../../../models/Milestone';
import { createTestUser, createTestProject } from '../../helpers/testHelpers';

describe('Milestone Model', () => {
  describe('Schema Validation', () => {
    it('should create milestone with valid data', async () => {
      const project = await createTestProject();

      const milestone = await Milestone.create({
        projectId: project._id,
        title: 'Foundation Complete',
        description: 'Complete foundation work',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: MilestoneStatus.PENDING,
        completionPercentage: 0,
      });

      expect(milestone.title).toBe('Foundation Complete');
      expect(milestone.status).toBe(MilestoneStatus.PENDING);
      expect(milestone.completionPercentage).toBe(0);
    });

    it('should fail without projectId', async () => {
      await expect(
        Milestone.create({
          title: 'Test Milestone',
          targetDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail without title', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          targetDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail with title shorter than 3 characters', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          title: 'AB',
          targetDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail with title longer than 200 characters', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          title: 'A'.repeat(201),
          targetDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail without targetDate', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          title: 'Test Milestone',
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          title: 'Test Milestone',
          targetDate: new Date(),
          status: 'INVALID' as MilestoneStatus,
        })
      ).rejects.toThrow();
    });

    it('should fail with completionPercentage below 0', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          title: 'Test Milestone',
          targetDate: new Date(),
          completionPercentage: -1,
        })
      ).rejects.toThrow();
    });

    it('should fail with completionPercentage above 100', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          title: 'Test Milestone',
          targetDate: new Date(),
          completionPercentage: 101,
        })
      ).rejects.toThrow();
    });

    it('should fail with description longer than 1000 characters', async () => {
      const project = await createTestProject();

      await expect(
        Milestone.create({
          projectId: project._id,
          title: 'Test Milestone',
          targetDate: new Date(),
          description: 'A'.repeat(1001),
        })
      ).rejects.toThrow();
    });
  });

  describe('Milestone Status', () => {
    it('should default to PENDING', async () => {
      const project = await createTestProject();

      const milestone = await Milestone.create({
        projectId: project._id,
        title: 'Test Milestone',
        targetDate: new Date(),
      });

      expect(milestone.status).toBe(MilestoneStatus.PENDING);
    });

    it('should accept PENDING status', async () => {
      const milestone = await createTestMilestone({ status: MilestoneStatus.PENDING });
      expect(milestone.status).toBe(MilestoneStatus.PENDING);
    });

    it('should accept IN_PROGRESS status', async () => {
      const milestone = await createTestMilestone({ status: MilestoneStatus.IN_PROGRESS });
      expect(milestone.status).toBe(MilestoneStatus.IN_PROGRESS);
    });

    it('should accept COMPLETED status', async () => {
      const milestone = await createTestMilestone({ status: MilestoneStatus.COMPLETED });
      expect(milestone.status).toBe(MilestoneStatus.COMPLETED);
    });
  });

  describe('Pre-save Hook', () => {
    it('should set completionDate when status changes to COMPLETED', async () => {
      const project = await createTestProject();

      const milestone = await Milestone.create({
        projectId: project._id,
        title: 'Test Milestone',
        targetDate: new Date(),
        status: MilestoneStatus.PENDING,
      });

      milestone.status = MilestoneStatus.COMPLETED;
      await milestone.save();

      expect(milestone.completionDate).toBeInstanceOf(Date);
    });

    it('should set completionPercentage to 100 when status changes to COMPLETED', async () => {
      const project = await createTestProject();

      const milestone = await Milestone.create({
        projectId: project._id,
        title: 'Test Milestone',
        targetDate: new Date(),
        completionPercentage: 50,
      });

      milestone.status = MilestoneStatus.COMPLETED;
      await milestone.save();

      expect(milestone.completionPercentage).toBe(100);
    });

    it('should not overwrite existing completionDate', async () => {
      const existingDate = new Date('2024-01-01');
      const project = await createTestProject();

      const milestone = await Milestone.create({
        projectId: project._id,
        title: 'Test Milestone',
        targetDate: new Date(),
        completionDate: existingDate,
      });

      milestone.status = MilestoneStatus.COMPLETED;
      await milestone.save();

      expect(milestone.completionDate).toEqual(existingDate);
    });

    it('should not change completionPercentage if already 100', async () => {
      const project = await createTestProject();

      const milestone = await Milestone.create({
        projectId: project._id,
        title: 'Test Milestone',
        targetDate: new Date(),
        completionPercentage: 100,
      });

      milestone.status = MilestoneStatus.COMPLETED;
      await milestone.save();

      expect(milestone.completionPercentage).toBe(100);
    });
  });

  describe('Dependencies', () => {
    it('should add milestone dependencies', async () => {
      const project = await createTestProject();
      const dependency = await Milestone.create({
        projectId: project._id,
        title: 'Dependency Milestone',
        targetDate: new Date(),
      });

      const milestone = await Milestone.create({
        projectId: project._id,
        title: 'Main Milestone',
        targetDate: new Date(),
        dependencies: [dependency._id],
      });

      expect(milestone.dependencies.length).toBe(1);
      expect(milestone.dependencies[0]).toEqual(dependency._id);
    });
  });

  describe('Assignment', () => {
    it('should assign milestone to user', async () => {
      const user = await createTestUser();
      const milestone = await createTestMilestone({ assignedTo: user._id });

      expect(milestone.assignedTo).toEqual(user._id);
    });
  });

  describe('Defaults', () => {
    it('should set default completionPercentage to 0', async () => {
      const milestone = await createTestMilestone();
      expect(milestone.completionPercentage).toBe(0);
    });

    it('should set default dependencies to empty array', async () => {
      const milestone = await createTestMilestone();
      expect(milestone.dependencies).toEqual([]);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const milestone = await createTestMilestone();
      expect(milestone.createdAt).toBeInstanceOf(Date);
      expect(milestone.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when milestone is modified', async () => {
      const milestone = await createTestMilestone();
      const originalUpdatedAt = milestone.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));
      milestone.title = 'Updated Milestone Title';
      await milestone.save();
      expect(milestone.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have projectId index', async () => {
      const indexes = Milestone.schema.indexes();
      const hasProjectIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].projectId !== undefined
      );
      expect(hasProjectIndex).toBe(true);
    });

    it('should have status index', async () => {
      const indexes = Milestone.schema.indexes();
      const hasStatusIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].status !== undefined
      );
      expect(hasStatusIndex).toBe(true);
    });

    it('should have targetDate index', async () => {
      const indexes = Milestone.schema.indexes();
      const hasTargetDateIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].targetDate !== undefined
      );
      expect(hasTargetDateIndex).toBe(true);
    });
  });
});

async function createTestMilestone(overrides: Partial<IMilestone> = {}): Promise<IMilestone> {
  const project = await createTestProject();

  const defaultMilestone = {
    projectId: project._id,
    title: 'Test Milestone',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  return Milestone.create({ ...defaultMilestone, ...overrides });
}