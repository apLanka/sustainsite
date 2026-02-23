import { Request, Response } from 'express';
import Material, { IMaterial, MaterialCategory, MaterialStatus } from '../models/Material';
import Equipment, { IEquipment, EquipmentType, EquipmentStatus, MaintenanceType } from '../models/Equipment';
import Supplier, { ISupplier } from '../models/Supplier';
import Project from '../models/Project';

/**
 * Resource Controller
 * Handles materials, equipment, and suppliers
 */

// ==================== Materials ====================

export const createMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, materialName, category, description, quantity, unit, unitPrice, supplier, purchaseOrderNumber, orderDate, expectedDeliveryDate, minimumThreshold, isEcoFriendly, recycledContent, certifications, notes } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    // Verify supplier exists
    const supplierDoc = await Supplier.findById(supplier);
    if (!supplierDoc) {
      res.status(404).json({ success: false, error: 'Supplier not found' });
      return;
    }

    const material = await Material.create({
      projectId,
      materialName,
      category,
      description,
      quantity,
      unit,
      unitPrice,
      supplier,
      purchaseOrderNumber,
      orderDate,
      expectedDeliveryDate,
      minimumThreshold: minimumThreshold || 0,
      status: MaterialStatus.ORDERED,
      isEcoFriendly: isEcoFriendly || false,
      recycledContent: recycledContent || 0,
      certifications: certifications || [],
      notes,
      createdBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, category, status, supplier, page = 1, limit = 10 } = req.query;

    const filter: Record<string, unknown> = {};
    if (projectId) filter.projectId = projectId;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;

    const skip = (Number(page) - 1) * Number(limit);

    const materials = await Material.find(filter)
      .populate('projectId', 'projectName')
      .populate('supplier', 'companyName')
      .populate('createdBy', 'fullName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Material.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: materials,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id)
      .populate('projectId', 'projectName')
      .populate('supplier', 'companyName email phoneNumber')
      .populate('createdBy', 'fullName email')
      .populate('usageHistory.usedBy', 'fullName');

    if (!material) {
      res.status(404).json({ success: false, error: 'Material not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields directly
    delete updates.projectId;
    delete updates.createdBy;

    const material = await Material.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('projectId', 'projectName')
      .populate('supplier', 'companyName');

    if (!material) {
      res.status(404).json({ success: false, error: 'Material not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await Material.findByIdAndDelete(id);

    if (!material) {
      res.status(404).json({ success: false, error: 'Material not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const updateMaterialStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = Object.values(MaterialStatus);
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status value' });
      return;
    }

    const material = await Material.findById(id);

    if (!material) {
      res.status(404).json({ success: false, error: 'Material not found' });
      return;
    }

    // If marking as delivered, update currentStock
    if (status === MaterialStatus.DELIVERED && material.currentStock === 0) {
      material.currentStock = material.quantity;
    }

    material.status = status;
    await material.save();

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const recordMaterialUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, purpose, notes } = req.body;

    const material = await Material.findById(id);

    if (!material) {
      res.status(404).json({ success: false, error: 'Material not found' });
      return;
    }

    if (quantity > material.currentStock) {
      res.status(400).json({ success: false, error: 'Insufficient stock for this usage' });
      return;
    }

    // Add to usage history
    material.usageHistory.push({
      usedQuantity: quantity,
      usedDate: new Date(),
      usedBy: req.user?.userId as unknown as import('mongoose').Types.ObjectId,
      purpose,
      notes,
    });

    // Update current stock
    material.currentStock -= quantity;

    // Update status if all stock is used
    if (material.currentStock === 0) {
      material.status = MaterialStatus.USED;
    }

    await material.save();

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getLowStockMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;

    let query = Material.find();

    if (projectId) {
      query = query.where('projectId', projectId);
    }

    const materials = await query
      .populate('projectId', 'projectName')
      .populate('supplier', 'companyName')
      .exec();

    // Filter for low stock in memory
    const lowStockMaterials = materials.filter(
      (mat) => mat.currentStock < mat.minimumThreshold
    );

    res.status(200).json({
      success: true,
      data: lowStockMaterials,
      count: lowStockMaterials.length,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error in getLowStockMaterials:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getCostSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const materials = await Material.find({ projectId });

    const totalMaterialCost = materials.reduce((sum, mat) => sum + mat.totalCost, 0);
    const totalUsedCost = materials.reduce((sum, mat) => {
      const usedQuantity = mat.quantity - mat.currentStock;
      return sum + (usedQuantity * mat.unitPrice);
    }, 0);
    const remainingValue = materials.reduce((sum, mat) => sum + (mat.currentStock * mat.unitPrice), 0);

    const byCategory = await Material.aggregate([
      { $match: { projectId: new (require('mongoose').Types.ObjectId)(projectId) } },
      {
        $group: {
          _id: '$category',
          totalCost: { $sum: '$totalCost' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        projectId,
        projectName: project.projectName,
        totalMaterialCost,
        totalUsedCost,
        remainingValue,
        materialCount: materials.length,
        byCategory,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

// ==================== Equipment ====================

export const createEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { equipmentName, equipmentType, serialNumber, assetId, manufacturer, equipmentModel, yearOfManufacture, purchasePrice, currentValue, depreciationRate, rentalRatePerDay, currentLocation, notes } = req.body;

    const equipment = await Equipment.create({
      equipmentName,
      equipmentType,
      serialNumber,
      assetId,
      manufacturer,
      equipmentModel,
      yearOfManufacture,
      purchasePrice,
      currentValue: currentValue || purchasePrice,
      depreciationRate,
      rentalRatePerDay,
      currentLocation,
      notes,
      status: EquipmentStatus.AVAILABLE,
    });

    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;

    const filter: Record<string, unknown> = {};
    if (type) filter.equipmentType = type;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const equipment = await Equipment.find(filter)
      .populate('currentProjectId', 'projectName')
      .populate('assignedTo', 'fullName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Equipment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: equipment,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getEquipmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
      .populate('currentProjectId', 'projectName location')
      .populate('assignedTo', 'fullName email')
      .populate('assignmentHistory.projectId', 'projectName')
      .populate('assignmentHistory.operatorId', 'fullName');

    if (!equipment) {
      res.status(404).json({ success: false, error: 'Equipment not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const updateEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields directly
    delete updates.currentProjectId;
    delete updates.assignmentHistory;

    const equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!equipment) {
      res.status(404).json({ success: false, error: 'Equipment not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const deleteEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      res.status(404).json({ success: false, error: 'Equipment not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Equipment deleted successfully',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const assignEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { projectId, operatorId } = req.body;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      res.status(404).json({ success: false, error: 'Equipment not found' });
      return;
    }

    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      res.status(400).json({ success: false, error: 'Equipment is not available for assignment' });
      return;
    }

    // Verify project exists if provided
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      equipment.currentProjectId = projectId;
    }

    // Add to assignment history
    equipment.assignmentHistory.push({
      projectId: projectId as unknown as import('mongoose').Types.ObjectId,
      assignedDate: new Date(),
      operatorId: operatorId as unknown as import('mongoose').Types.ObjectId,
    });

    if (operatorId) {
      equipment.assignedTo = operatorId as unknown as import('mongoose').Types.ObjectId;
    }

    equipment.status = EquipmentStatus.IN_USE;
    await equipment.save();

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const scheduleMaintenanceForEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { maintenanceType, description, cost, performedBy, nextMaintenanceMonths } = req.body;

    const validTypes = Object.values(MaintenanceType);
    if (!validTypes.includes(maintenanceType)) {
      res.status(400).json({ success: false, error: 'Invalid maintenance type' });
      return;
    }

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      res.status(404).json({ success: false, error: 'Equipment not found' });
      return;
    }

    const maintenanceRecord = {
      maintenanceDate: new Date(),
      maintenanceType,
      description,
      cost,
      performedBy,
    };

    // Schedule next maintenance if requested
    if (nextMaintenanceMonths) {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + nextMaintenanceMonths);
      (maintenanceRecord as { nextMaintenanceDate?: Date }).nextMaintenanceDate = nextDate;
      equipment.nextScheduledMaintenance = nextDate;
    }

    equipment.maintenanceHistory.push(maintenanceRecord as import('../models/Equipment').IMaintenanceRecord);
    equipment.lastMaintenanceDate = new Date();

    // If major maintenance, mark as under maintenance
    if (maintenanceType === MaintenanceType.REPAIR || maintenanceType === MaintenanceType.OVERHAUL) {
      equipment.status = EquipmentStatus.UNDER_MAINTENANCE;
    }

    await equipment.save();

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const updateEquipmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = Object.values(EquipmentStatus);
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status value' });
      return;
    }

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      res.status(404).json({ success: false, error: 'Equipment not found' });
      return;
    }

    equipment.status = status;

    // If marking as available, clear current project assignment
    if (status === EquipmentStatus.AVAILABLE) {
      equipment.currentProjectId = undefined;
      equipment.assignedTo = undefined;
    }

    await equipment.save();

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getAvailableEquipment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;

    const filter: Record<string, unknown> = { status: EquipmentStatus.AVAILABLE };
    if (type) filter.equipmentType = type;

    const equipment = await Equipment.find(filter)
      .populate('currentProjectId', 'projectName')
      .sort({ equipmentName: 1 });

    res.status(200).json({
      success: true,
      data: equipment,
      count: equipment.length,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

// ==================== Suppliers ====================

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, registrationNumber, vatNumber, contactPerson, email, phoneNumber, alternatePhone, address, materialsSupplied, servicesProvided, paymentTerms, deliveryLeadTime, isSustainabilityCertified, certifications, sustainabilityScore, isActive, isPreferred, notes } = req.body;

    const supplier = await Supplier.create({
      companyName,
      registrationNumber,
      vatNumber,
      contactPerson,
      email,
      phoneNumber,
      alternatePhone,
      address,
      materialsSupplied: materialsSupplied || [],
      servicesProvided: servicesProvided || [],
      paymentTerms,
      deliveryLeadTime,
      isSustainabilityCertified: isSustainabilityCertified || false,
      certifications: certifications || [],
      sustainabilityScore,
      isActive: isActive !== undefined ? isActive : true,
      isPreferred: isPreferred || false,
      notes,
      addedBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, isPreferred, blacklisted, page = 1, limit = 10, search } = req.query;

    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPreferred !== undefined) filter.isPreferred = isPreferred === 'true';
    if (blacklisted !== undefined) filter.blacklisted = blacklisted === 'true';
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const suppliers = await Supplier.find(filter)
      .populate('addedBy', 'fullName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ averageRating: -1, companyName: 1 });

    const total = await Supplier.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: suppliers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id)
      .populate('addedBy', 'fullName email')
      .populate('ratings.ratedBy', 'fullName');

    if (!supplier) {
      res.status(404).json({ success: false, error: 'Supplier not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields directly
    delete updates.addedBy;
    delete updates.totalOrders;
    delete updates.completedOrders;
    delete updates.ratings;
    delete updates.averageRating;

    const supplier = await Supplier.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!supplier) {
      res.status(404).json({ success: false, error: 'Supplier not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      res.status(404).json({ success: false, error: 'Supplier not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const rateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
      return;
    }

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      res.status(404).json({ success: false, error: 'Supplier not found' });
      return;
    }

    supplier.ratings.push({
      ratedBy: req.user?.userId as unknown as import('mongoose').Types.ObjectId,
      rating,
      comment,
      ratedDate: new Date(),
    });

    await supplier.save();

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    const err = error as Error;
    res.status(400).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};

export const getSupplierPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id);

    if (!supplier) {
      res.status(404).json({ success: false, error: 'Supplier not found' });
      return;
    }

    const completionRate = supplier.totalOrders > 0
      ? (supplier.completedOrders / supplier.totalOrders) * 100
      : 0;

    // Get recent ratings
    const recentRatings = supplier.ratings.slice(-10);

    res.status(200).json({
      success: true,
      data: {
        supplierId: supplier._id,
        companyName: supplier.companyName,
        totalOrders: supplier.totalOrders,
        completedOrders: supplier.completedOrders,
        completionRate: parseFloat(completionRate.toFixed(2)),
        onTimeDeliveryRate: supplier.onTimeDeliveryRate,
        averageRating: supplier.averageRating,
        recentRatings,
        isSustainabilityCertified: supplier.isSustainabilityCertified,
        sustainabilityScore: supplier.sustainabilityScore,
        isPreferred: supplier.isPreferred,
        isActive: supplier.isActive,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      error: err.message || 'Server error',
    });
  }
};
