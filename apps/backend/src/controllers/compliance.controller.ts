import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ComplianceChecklist from '../models/ComplianceChecklist';
import SafetyInspection from '../models/SafetyInspection';

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

    if (items !== undefined) {
      checklist.items = items.map((item: Record<string, unknown>) => ({
        ...item,

        completedBy: item.isCompleted && !item.completedBy
          ? new mongoose.Types.ObjectId(req.user!.userId)
          : item.completedBy,
      }));
    }

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

export const updateInspection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid inspection ID format' });
      return;
    }

    const inspection = await SafetyInspection.findById(id);

    if (!inspection) {
      res.status(404).json({ success: false, error: 'Inspection not found' });
      return;
    }

    const {
      inspectionType,
      inspectionDate,
      inspectorNotes,
      findings,
      riskLevel,
      issuesIdentified,
      actionRequired,
      recommendedActions,
      actionDeadline,
      actionStatus,
      attachments,
      photos,
      followUpDate,
      followUpNotes,
    } = req.body;

    if (inspectionType !== undefined) inspection.inspectionType = inspectionType;
    if (inspectionDate !== undefined) inspection.inspectionDate = inspectionDate;
    if (inspectorNotes !== undefined) inspection.inspectorNotes = inspectorNotes;
    if (findings !== undefined) inspection.findings = findings;
    if (riskLevel !== undefined) inspection.riskLevel = riskLevel;
    if (issuesIdentified !== undefined) inspection.issuesIdentified = issuesIdentified;
    if (actionRequired !== undefined) inspection.actionRequired = actionRequired;
    if (recommendedActions !== undefined) inspection.recommendedActions = recommendedActions;
    if (actionDeadline !== undefined) inspection.actionDeadline = actionDeadline;
    if (actionStatus !== undefined) inspection.actionStatus = actionStatus;
    if (attachments !== undefined) inspection.attachments = attachments;
    if (photos !== undefined) inspection.photos = photos;
    if (followUpDate !== undefined) inspection.followUpDate = followUpDate;
    if (followUpNotes !== undefined) inspection.followUpNotes = followUpNotes;

    await inspection.save();

    await inspection.populate('inspector', 'name email');
    await inspection.populate('attachments', 'title fileUrl fileName documentType');

    res.status(200).json({ success: true, data: inspection });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const deleteInspection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid inspection ID format' });
      return;
    }

    const inspection = await SafetyInspection.findByIdAndDelete(id);

    if (!inspection) {
      res.status(404).json({ success: false, error: 'Inspection not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Inspection deleted successfully' });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
