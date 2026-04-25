import Equipment, { IEquipment, EquipmentType, EquipmentStatus, MaintenanceType } from '../../../models/Equipment';
import { createTestUser, createTestEquipment, createTestProject } from '../../helpers/testHelpers';

describe('Equipment Model', () => {
  describe('Schema Validation', () => {
    it('should create equipment with valid data', async () => {
      const equipment = await Equipment.create({
        equipmentName: 'Heavy Excavator',
        equipmentType: EquipmentType.EXCAVATOR,
        manufacturer: 'Caterpillar',
        equipmentModel: 'CAT-320',
        yearOfManufacture: 2022,
        status: EquipmentStatus.AVAILABLE,
        purchasePrice: 150000,
        currentValue: 120000,
        depreciationRate: 20,
        rentalRatePerDay: 800,
      });

      expect(equipment.equipmentName).toBe('Heavy Excavator');
      expect(equipment.equipmentType).toBe(EquipmentType.EXCAVATOR);
      expect(equipment.status).toBe(EquipmentStatus.AVAILABLE);
    });

    it('should fail without equipmentName', async () => {
      await expect(
        Equipment.create({
          equipmentType: EquipmentType.EXCAVATOR,
        })
      ).rejects.toThrow();
    });

    it('should fail with equipmentName shorter than 2 characters', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'A',
          equipmentType: EquipmentType.EXCAVATOR,
        })
      ).rejects.toThrow();
    });

    it('should fail with equipmentName longer than 200 characters', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'A'.repeat(201),
          equipmentType: EquipmentType.EXCAVATOR,
        })
      ).rejects.toThrow();
    });

    it('should fail without equipmentType', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid equipmentType', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: 'INVALID_TYPE' as EquipmentType,
        })
      ).rejects.toThrow();
    });

    it('should fail with yearOfManufacture before 1900', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          yearOfManufacture: 1899,
        })
      ).rejects.toThrow();
    });

    it('should fail with yearOfManufacture in the future', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          yearOfManufacture: new Date().getFullYear() + 1,
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          status: 'INVALID' as EquipmentStatus,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative purchasePrice', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          purchasePrice: -1000,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative currentValue', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          currentValue: -1000,
        })
      ).rejects.toThrow();
    });

    it('should fail with depreciationRate above 100', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          depreciationRate: 101,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative depreciationRate', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          depreciationRate: -10,
        })
      ).rejects.toThrow();
    });

    it('should fail with negative rentalRatePerDay', async () => {
      await expect(
        Equipment.create({
          equipmentName: 'Test Equipment',
          equipmentType: EquipmentType.EXCAVATOR,
          rentalRatePerDay: -100,
        })
      ).rejects.toThrow();
    });

    it('should accept unique serialNumber', async () => {
      const equipment = await createTestEquipment({ serialNumber: 'SN-12345' });
      expect(equipment.serialNumber).toBe('SN-12345');
    });

    it('should accept unique assetId', async () => {
      const equipment = await createTestEquipment({ assetId: 'AST-001' });
      expect(equipment.assetId).toBe('AST-001');
    });

    it('should enforce unique serialNumber', async () => {
      await createTestEquipment({ serialNumber: 'SN-UNIQUE-001' });
      await expect(
        createTestEquipment({ serialNumber: 'SN-UNIQUE-001' })
      ).rejects.toThrow();
    });

    it('should enforce unique assetId', async () => {
      await createTestEquipment({ assetId: 'AST-UNIQUE-001' });
      await expect(
        createTestEquipment({ assetId: 'AST-UNIQUE-001' })
      ).rejects.toThrow();
    });
  });

  describe('Equipment Types', () => {
    it('should accept EXCAVATOR type', async () => {
      const equipment = await createTestEquipment({ equipmentType: EquipmentType.EXCAVATOR });
      expect(equipment.equipmentType).toBe(EquipmentType.EXCAVATOR);
    });

    it('should accept CRANE type', async () => {
      const equipment = await createTestEquipment({ equipmentType: EquipmentType.CRANE });
      expect(equipment.equipmentType).toBe(EquipmentType.CRANE);
    });

    it('should accept BULLDOZER type', async () => {
      const equipment = await createTestEquipment({ equipmentType: EquipmentType.BULLDOZER });
      expect(equipment.equipmentType).toBe(EquipmentType.BULLDOZER);
    });

    it('should accept MIXER type', async () => {
      const equipment = await createTestEquipment({ equipmentType: EquipmentType.MIXER });
      expect(equipment.equipmentType).toBe(EquipmentType.MIXER);
    });

    it('should accept LOADER type', async () => {
      const equipment = await createTestEquipment({ equipmentType: EquipmentType.LOADER });
      expect(equipment.equipmentType).toBe(EquipmentType.LOADER);
    });

    it('should accept OTHER type', async () => {
      const equipment = await createTestEquipment({ equipmentType: EquipmentType.OTHER });
      expect(equipment.equipmentType).toBe(EquipmentType.OTHER);
    });
  });

  describe('Equipment Status', () => {
    it('should default to AVAILABLE status', async () => {
      const equipment = await createTestEquipment();
      expect(equipment.status).toBe(EquipmentStatus.AVAILABLE);
    });

    it('should accept IN_USE status', async () => {
      const equipment = await createTestEquipment({ status: EquipmentStatus.IN_USE });
      expect(equipment.status).toBe(EquipmentStatus.IN_USE);
    });

    it('should accept UNDER_MAINTENANCE status', async () => {
      const equipment = await createTestEquipment({ status: EquipmentStatus.UNDER_MAINTENANCE });
      expect(equipment.status).toBe(EquipmentStatus.UNDER_MAINTENANCE);
    });

    it('should accept DAMAGED status', async () => {
      const equipment = await createTestEquipment({ status: EquipmentStatus.DAMAGED });
      expect(equipment.status).toBe(EquipmentStatus.DAMAGED);
    });

    it('should accept RETIRED status', async () => {
      const equipment = await createTestEquipment({ status: EquipmentStatus.RETIRED });
      expect(equipment.status).toBe(EquipmentStatus.RETIRED);
    });
  });

  describe('Method: scheduleNextMaintenance', () => {
    it('should schedule next maintenance in specified months', async () => {
      const equipment = await createTestEquipment();
      const initialDate = new Date();
      equipment.scheduleNextMaintenance(3);
      
      expect(equipment.nextScheduledMaintenance).toBeInstanceOf(Date);
      expect(equipment.nextScheduledMaintenance!.getTime()).toBeGreaterThan(initialDate.getTime());
    });

    it('should schedule 1 month ahead', async () => {
      const equipment = await createTestEquipment();
      equipment.scheduleNextMaintenance(1);
      
      const expectedMonth = new Date();
      expectedMonth.setMonth(expectedMonth.getMonth() + 1);
      
      expect(equipment.nextScheduledMaintenance!.getMonth()).toBe(expectedMonth.getMonth());
    });

    it('should schedule 6 months ahead', async () => {
      const equipment = await createTestEquipment();
      equipment.scheduleNextMaintenance(6);
      
      const expectedMonth = new Date();
      expectedMonth.setMonth(expectedMonth.getMonth() + 6);
      
      expect(equipment.nextScheduledMaintenance!.getMonth()).toBe(expectedMonth.getMonth());
    });
  });

  describe('Method: assignToProject', () => {
    it('should assign available equipment to project', async () => {
      const user = await createTestUser();
      const project = await createTestProject();
      const equipment = await createTestEquipment({ status: EquipmentStatus.AVAILABLE });

      await equipment.assignToProject(project._id, user._id);

      expect(equipment.currentProjectId).toEqual(project._id);
      expect(equipment.assignedTo).toEqual(user._id);
      expect(equipment.status).toBe(EquipmentStatus.IN_USE);
    });

    it('should add assignment record to history', async () => {
      const user = await createTestUser();
      const project = await createTestProject();
      const equipment = await createTestEquipment({ status: EquipmentStatus.AVAILABLE });

      await equipment.assignToProject(project._id, user._id);

      expect(equipment.assignmentHistory.length).toBe(1);
      expect(equipment.assignmentHistory[0].projectId).toEqual(project._id);
    });

    it('should throw error when equipment is not available', async () => {
      const project = await createTestProject();
      const equipment = await createTestEquipment({ status: EquipmentStatus.IN_USE });

      await expect(
        equipment.assignToProject(project._id)
      ).rejects.toThrow('Equipment is not available');
    });

    it('should throw error when equipment is under maintenance', async () => {
      const project = await createTestProject();
      const equipment = await createTestEquipment({ status: EquipmentStatus.UNDER_MAINTENANCE });

      await expect(
        equipment.assignToProject(project._id)
      ).rejects.toThrow('Equipment is not available');
    });

    it('should throw error when equipment is damaged', async () => {
      const project = await createTestProject();
      const equipment = await createTestEquipment({ status: EquipmentStatus.DAMAGED });

      await expect(
        equipment.assignToProject(project._id)
      ).rejects.toThrow('Equipment is not available');
    });

    it('should throw error when equipment is retired', async () => {
      const project = await createTestProject();
      const equipment = await createTestEquipment({ status: EquipmentStatus.RETIRED });

      await expect(
        equipment.assignToProject(project._id)
      ).rejects.toThrow('Equipment is not available');
    });

    it('should allow assignment without operator', async () => {
      const project = await createTestProject();
      const equipment = await createTestEquipment({ status: EquipmentStatus.AVAILABLE });

      await equipment.assignToProject(project._id);

      expect(equipment.currentProjectId).toEqual(project._id);
      expect(equipment.assignedTo).toBeUndefined();
    });
  });

  describe('Maintenance History', () => {
    it('should add maintenance record', async () => {
      const equipment = await createTestEquipment();
      equipment.maintenanceHistory.push({
        maintenanceDate: new Date(),
        maintenanceType: MaintenanceType.ROUTINE,
        description: 'Regular maintenance',
        cost: 500,
        performedBy: 'Maintenance Team',
      });

      await equipment.save();

      expect(equipment.maintenanceHistory.length).toBe(1);
      expect(equipment.maintenanceHistory[0].maintenanceType).toBe(MaintenanceType.ROUTINE);
    });

    it('should accept valid maintenance types', async () => {
      const equipment = await createTestEquipment();
      equipment.maintenanceHistory.push({
        maintenanceDate: new Date(),
        maintenanceType: MaintenanceType.REPAIR,
      });
      await equipment.save();
      expect(equipment.maintenanceHistory[0].maintenanceType).toBe(MaintenanceType.REPAIR);
    });
  });

  describe('Defaults', () => {
    it('should set default status to AVAILABLE', async () => {
      const equipment = await Equipment.create({
        equipmentName: 'Test Equipment',
        equipmentType: EquipmentType.EXCAVATOR,
      });
      expect(equipment.status).toBe(EquipmentStatus.AVAILABLE);
    });

    it('should set empty maintenance history', async () => {
      const equipment = await createTestEquipment();
      expect(equipment.maintenanceHistory).toEqual([]);
    });

    it('should set empty assignment history', async () => {
      const equipment = await createTestEquipment();
      expect(equipment.assignmentHistory).toEqual([]);
    });
  });

  describe('Timestamps', () => {
    it('should automatically set createdAt and updatedAt', async () => {
      const equipment = await createTestEquipment();
      expect(equipment.createdAt).toBeInstanceOf(Date);
      expect(equipment.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when equipment is modified', async () => {
      const equipment = await createTestEquipment();
      const originalUpdatedAt = equipment.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10));
      equipment.equipmentName = 'Updated Equipment Name';
      await equipment.save();
      expect(equipment.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Indexes', () => {
    it('should have status index', async () => {
      const indexes = Equipment.schema.indexes();
      const hasStatusIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].status !== undefined
      );
      expect(hasStatusIndex).toBe(true);
    });

    it('should have currentProjectId index', async () => {
      const indexes = Equipment.schema.indexes();
      const hasProjectIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].currentProjectId !== undefined
      );
      expect(hasProjectIndex).toBe(true);
    });

    it('should have nextScheduledMaintenance index', async () => {
      const indexes = Equipment.schema.indexes();
      const hasMaintenanceIndex = indexes.some(
        (idx: any) => idx[0] && idx[0].nextScheduledMaintenance !== undefined
      );
      expect(hasMaintenanceIndex).toBe(true);
    });
  });
});