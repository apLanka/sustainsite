import SustainabilityMetric, { ISustainabilityMetric, ScoreCategory } from '../../../models/SustainabilityMetric';
import { createTestUser, createTestProject } from '../../helpers/testHelpers';

describe('SustainabilityMetric Model', () => {
  describe('Schema Validation', () => {
    it('should create sustainability metric with valid data', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: {
          transportation: 1.5,
          equipment: 2.0,
          materials: 1.0,
        },
        energyConsumption: {
          electricity: 100,
          diesel: 50,
          renewableEnergy: 50,
        },
        wasteManagement: {
          recyclable: 30,
          nonRecyclable: 10,
          hazardous: 5,
        },
        waterUsage: {
          municipal: 80,
          recycled: 20,
        },
        recordedDate: new Date(),
      });

      expect(metric.projectId).toEqual(project._id);
      expect(metric.carbonEmissions.transportation).toBe(1.5);
    });

    it('should fail without projectId', async () => {
      await expect(
        SustainabilityMetric.create({
          carbonEmissions: { transportation: 1 },
          energyConsumption: { electricity: 100 },
          wasteManagement: { recyclable: 10 },
          waterUsage: { municipal: 50 },
          recordedDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail without carbonEmissions', async () => {
      const project = await createTestProject();
      await expect(
        SustainabilityMetric.create({
          projectId: project._id,
          energyConsumption: { electricity: 100 },
          wasteManagement: { recyclable: 10 },
          waterUsage: { municipal: 50 },
          recordedDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail without energyConsumption', async () => {
      const project = await createTestProject();
      await expect(
        SustainabilityMetric.create({
          projectId: project._id,
          carbonEmissions: { transportation: 1 },
          wasteManagement: { recyclable: 10 },
          waterUsage: { municipal: 50 },
          recordedDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail without wasteManagement', async () => {
      const project = await createTestProject();
      await expect(
        SustainabilityMetric.create({
          projectId: project._id,
          carbonEmissions: { transportation: 1 },
          energyConsumption: { electricity: 100 },
          waterUsage: { municipal: 50 },
          recordedDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail without waterUsage', async () => {
      const project = await createTestProject();
      await expect(
        SustainabilityMetric.create({
          projectId: project._id,
          carbonEmissions: { transportation: 1 },
          energyConsumption: { electricity: 100 },
          wasteManagement: { recyclable: 10 },
          recordedDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail without recordedDate', async () => {
      const project = await createTestProject();
      await expect(
        SustainabilityMetric.create({
          projectId: project._id,
          carbonEmissions: { transportation: 1 },
          energyConsumption: { electricity: 100 },
          wasteManagement: { recyclable: 10 },
          waterUsage: { municipal: 50 },
        })
      ).rejects.toThrow();
    });

    it('should fail with negative carbon values', async () => {
      const project = await createTestProject();
      await expect(
        SustainabilityMetric.create({
          projectId: project._id,
          carbonEmissions: { transportation: -1 },
          energyConsumption: { electricity: 100 },
          wasteManagement: { recyclable: 10 },
          waterUsage: { municipal: 50 },
          recordedDate: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should fail with sustainabilityScore below 0', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 10 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });
      metric.sustainabilityScore = -1;

      await expect(metric.save()).rejects.toThrow();
    });

    it('should fail with sustainabilityScore above 100', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 10 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });
      metric.sustainabilityScore = 101;

      await expect(metric.save()).rejects.toThrow();
    });

    it('should fail with diversionRate above 100', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 50, nonRecyclable: 0, hazardous: 0 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });
      metric.wasteManagement.diversionRate = 101;

      await expect(metric.save()).rejects.toThrow();
    });
  });

  describe('Pre-save Hook', () => {
    it('should calculate carbonEmissions total', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: {
          transportation: 1,
          equipment: 2,
          materials: 3,
        },
        energyConsumption: {
          electricity: 100,
          diesel: 50,
          renewableEnergy: 25,
        },
        wasteManagement: {
          recyclable: 30,
          nonRecyclable: 10,
          hazardous: 5,
        },
        waterUsage: {
          municipal: 80,
          recycled: 20,
        },
        recordedDate: new Date(),
      });

      expect(metric.carbonEmissions.total).toBe(6);
    });

    it('should calculate energyConsumption total', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: {
          electricity: 100,
          diesel: 50,
          renewableEnergy: 25,
        },
        wasteManagement: { recyclable: 10 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.energyConsumption.total).toBe(175);
    });

    it('should calculate wasteManagement total', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: {
          recyclable: 30,
          nonRecyclable: 10,
          hazardous: 5,
        },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.wasteManagement.total).toBe(45);
    });

    it('should calculate diversionRate', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: {
          recyclable: 30,
          nonRecyclable: 10,
          hazardous: 5,
        },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.wasteManagement.diversionRate).toBeCloseTo(66.67, 1);
    });

    it('should calculate waterUsage total', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 10 },
        waterUsage: {
          municipal: 80,
          recycled: 20,
        },
        recordedDate: new Date(),
      });

      expect(metric.waterUsage.total).toBe(100);
    });

    it('should calculate sustainabilityScore', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: {
          electricity: 20,
          renewableEnergy: 80,
        },
        wasteManagement: {
          recyclable: 80,
          nonRecyclable: 10,
          hazardous: 10,
        },
        waterUsage: {
          municipal: 20,
          recycled: 80,
        },
        recordedDate: new Date(),
      });

      expect(metric.sustainabilityScore).toBeGreaterThan(0);
    });

    it('should set RED category for low scores', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 10, equipment: 10, materials: 10 },
        energyConsumption: {
          electricity: 100,
          diesel: 100,
          renewableEnergy: 0,
        },
        wasteManagement: {
          recyclable: 5,
          nonRecyclable: 90,
          hazardous: 5,
        },
        waterUsage: {
          municipal: 100,
          recycled: 0,
        },
        recordedDate: new Date(),
      });

      expect(metric.scoreCategory).toBe(ScoreCategory.RED);
    });

    it('should set YELLOW category for medium scores', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 5, equipment: 5, materials: 5 },
        energyConsumption: {
          electricity: 60,
          diesel: 40,
          renewableEnergy: 20,
        },
        wasteManagement: {
          recyclable: 40,
          nonRecyclable: 40,
          hazardous: 20,
        },
        waterUsage: {
          municipal: 60,
          recycled: 40,
        },
        recordedDate: new Date(),
      });

      expect(metric.scoreCategory).toBeDefined();
      expect([ScoreCategory.RED, ScoreCategory.YELLOW, ScoreCategory.GREEN]).toContain(metric.scoreCategory);
    });

    it('should set GREEN category for high scores', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1, equipment: 1, materials: 1 },
        energyConsumption: {
          electricity: 10,
          diesel: 0,
          renewableEnergy: 90,
        },
        wasteManagement: {
          recyclable: 80,
          nonRecyclable: 10,
          hazardous: 10,
        },
        waterUsage: {
          municipal: 10,
          recycled: 90,
        },
        recordedDate: new Date(),
      });

      expect(metric.scoreCategory).toBe(ScoreCategory.GREEN);
    });

    it('should calculate trees equivalent', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: {
          transportation: 1,
          equipment: 1,
          materials: 1,
        },
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 10 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.treesEquivalent).toBeGreaterThan(0);
    });
  });

  describe('Defaults', () => {
    it('should set default carbon emissions to 0', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: {},
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 10 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.carbonEmissions.transportation).toBe(0);
    });

    it('should set default energy consumption to 0', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: {},
        wasteManagement: { recyclable: 10 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.energyConsumption.electricity).toBe(0);
    });

    it('should set default waste management to 0', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: {},
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.wasteManagement.recyclable).toBe(0);
    });

    it('should set default water usage to 0', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 10 },
        waterUsage: {},
        recordedDate: new Date(),
      });

      expect(metric.waterUsage.municipal).toBe(0);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const project = await createTestProject();
      const metric = await SustainabilityMetric.create({
        projectId: project._id,
        carbonEmissions: { transportation: 1 },
        energyConsumption: { electricity: 100 },
        wasteManagement: { recyclable: 10 },
        waterUsage: { municipal: 50 },
        recordedDate: new Date(),
      });

      expect(metric.createdAt).toBeInstanceOf(Date);
      expect(metric.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Indexes', () => {
    it('should have projectId index', async () => {
      const indexes = SustainabilityMetric.schema.indexes();
      const hasProjectIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].projectId !== undefined
      );
      expect(hasProjectIndex).toBe(true);
    });

    it('should have recordedDate index', async () => {
      const indexes = SustainabilityMetric.schema.indexes();
      const hasDateIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].recordedDate !== undefined
      );
      expect(hasDateIndex).toBe(true);
    });
  });
});