import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ComplianceChecklist from '../models/ComplianceChecklist';
import SafetyInspection from '../models/SafetyInspection';

/**
 * Compliance Controller
 * Handles compliance checklists and safety inspections
 */

// ==================== Compliance Checklists ====================

// Task 10: Create a compliance checklist
export const createChecklist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, checklistName, category, items, dueDate, lastReviewDate } = req.body;

    if (!projectId || !checklistName) {
      res.status(400).json({ success: false, error: 'projectId and checklistName are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ success: false, error: 'Invalid projectId format' });
      return;
    }

    const checklist = await ComplianceChecklist.create({
      projectId,
      checklistName,
      category,
      items: items ?? [],
      dueDate,
      lastReviewDate,
      createdBy: req.user!.userId,
    });

    res.status(201).json({ success: true, data: checklist });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// Task 11: Get all checklists with optional filters and pagination
export const getChecklists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, category, page = '1', limit = '10' } = req.query;

    const filter: Record<string, unknown> = {};

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
        res.status(400).json({ success: false, error: 'Invalid projectId format' });
        return;
      }
      filter.projectId = projectId;
    }

    if (category) filter.category = category;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [checklists, total] = await Promise.all([
      ComplianceChecklist.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ComplianceChecklist.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: checklists,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// Task 12: Get checklist by ID
export const getChecklistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid checklist ID format' });
      return;
    }

    const checklist = await ComplianceChecklist.findById(id)
      .populate('createdBy', 'name email')
      .populate('items.completedBy', 'name email')
      .populate('items.attachedDocuments', 'title fileUrl fileName documentType');

    if (!checklist) {
      res.status(404).json({ success: false, error: 'Checklist not found' });
      return;
    }

    res.status(200).json({ success: true, data: checklist });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// Task 13: Update checklist (metadata and/or items)
export const updateChecklist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid checklist ID format' });
      return;
    }

    const checklist = await ComplianceChecklist.findById(id);

    if (!checklist) {
      res.status(404).json({ success: false, error: 'Checklist not found' });
      return;
    }

    const { checklistName, category, dueDate, lastReviewDate, items } = req.body;

    if (checklistName !== undefined) checklist.checklistName = checklistName;
    if (category !== undefined) checklist.category = category;
    if (dueDate !== undefined) checklist.dueDate = dueDate;
    if (lastReviewDate !== undefined) checklist.lastReviewDate = lastReviewDate;

    // Replace items array if provided — completedBy is set per item by the caller
    if (items !== undefined) {
      checklist.items = items.map((item: Record<string, unknown>) => ({
        ...item,
        // Auto-assign completedBy from current user if item is being marked complete without a completedBy
        completedBy: item.isCompleted && !item.completedBy
          ? new mongoose.Types.ObjectId(req.user!.userId)
          : item.completedBy,
      }));
    }

    // pre-save hook auto-recalculates totalItems, completedItems, complianceScore
    await checklist.save();

    await checklist.populate('createdBy', 'name email');
    await checklist.populate('items.completedBy', 'name email');
    await checklist.populate('items.attachedDocuments', 'title fileUrl fileName documentType');

    res.status(200).json({ success: true, data: checklist });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// Task 14: Delete checklist (ADMIN only — enforced by route middleware)
export const deleteChecklist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid checklist ID format' });
      return;
    }

    const checklist = await ComplianceChecklist.findByIdAndDelete(id);

    if (!checklist) {
      res.status(404).json({ success: false, error: 'Checklist not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Checklist deleted successfully' });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// ==================== Safety Inspections ====================

// Task 15: Create a safety inspection
export const createInspection = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      inspectionType,
      inspectionDate,
      inspectorNotes,
      findings,
      riskLevel,
      issuesIdentified,
      actionRequired,
      recommendedActions,
      actionDeadline,
      attachments,
      photos,
      followUpDate,
      followUpNotes,
    } = req.body;

    if (!projectId || !inspectionDate || !findings || !riskLevel) {
      res.status(400).json({
        success: false,
        error: 'projectId, inspectionDate, findings, and riskLevel are required',
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ success: false, error: 'Invalid projectId format' });
      return;
    }

    const inspection = await SafetyInspection.create({
      projectId,
      inspectionType,
      inspectionDate,
      inspector: req.user!.userId,
      inspectorNotes,
      findings,
      riskLevel,
      issuesIdentified: issuesIdentified ?? [],
      actionRequired,
      recommendedActions: recommendedActions ?? [],
      actionDeadline,
      attachments: attachments ?? [],
      photos: photos ?? [],
      followUpDate,
      followUpNotes,
    });

    await inspection.populate('inspector', 'name email');

    res.status(201).json({ success: true, data: inspection });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// Task 16: Get all inspections with optional filters and pagination
export const getInspections = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      riskLevel,
      actionStatus,
      isResolved,
      inspectionType,
      page = '1',
      limit = '10',
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
        res.status(400).json({ success: false, error: 'Invalid projectId format' });
        return;
      }
      filter.projectId = projectId;
    }

    if (riskLevel) filter.riskLevel = riskLevel;
    if (actionStatus) filter.actionStatus = actionStatus;
    if (inspectionType) filter.inspectionType = inspectionType;
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [inspections, total] = await Promise.all([
      SafetyInspection.find(filter)
        .populate('inspector', 'name email')
        .sort({ inspectionDate: -1 })
        .skip(skip)
        .limit(limitNum),
      SafetyInspection.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: inspections,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// Task 17: Get inspection by ID
export const getInspectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid inspection ID format' });
      return;
    }

    const inspection = await SafetyInspection.findById(id)
      .populate('inspector', 'name email')
      .populate('attachments', 'title fileUrl fileName documentType');

    if (!inspection) {
      res.status(404).json({ success: false, error: 'Inspection not found' });
      return;
    }

    res.status(200).json({ success: true, data: inspection });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const updateInspection = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement update inspection logic
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

export const deleteInspection = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement delete inspection logic
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};
