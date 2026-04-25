import { Request, Response } from 'express';
import mongoose, { type Document } from 'mongoose';
import ComplianceChecklist from '../models/ComplianceChecklist';
import SafetyInspection from '../models/SafetyInspection';
import Project from '../models/Project';
import User from '../models/User';
import { sendEmail, emailTemplates } from '../config/email';
import logger from '../utils/logger';
function effectiveChecklistRollup(c: {
  items?: {
    isCompleted?: boolean;
  }[];
  totalItems?: number;
  completedItems?: number;
  complianceScore?: number;
}): {
  totalItems: number;
  completedItems: number;
  complianceScore: number;
} {
  const items = c.items ?? [];
  const n = items.length;
  const done = items.filter((i) => i.isCompleted).length;
  const storedT = Number(c.totalItems) || 0;
  const storedD = Number(c.completedItems) || 0;
  if (n > 0 && storedT === 0 && storedD === 0) {
    return {
      totalItems: n,
      completedItems: done,
      complianceScore: Math.round((done / n) * 100),
    };
  }
  return {
    totalItems: storedT,
    completedItems: storedD,
    complianceScore: Number(c.complianceScore) || 0,
  };
}
function checklistDocToResponse(doc: Document): Record<string, unknown> {
  const plain = doc.toObject();
  return { ...plain, ...effectiveChecklistRollup(plain) };
}
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
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      ComplianceChecklist.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: checklists.map((c) => checklistDocToResponse(c)),
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
      .populate('createdBy', 'fullName email')
      .populate('items.completedBy', 'fullName email')
      .populate('items.attachedDocuments', 'title fileUrl fileName documentType');
    if (!checklist) {
      res.status(404).json({ success: false, error: 'Checklist not found' });
      return;
    }
    res.status(200).json({ success: true, data: checklistDocToResponse(checklist) });
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
        completedBy:
          item.isCompleted && !item.completedBy
            ? new mongoose.Types.ObjectId(req.user!.userId)
            : item.completedBy,
      }));
    }
    await checklist.save();
    await checklist.populate('createdBy', 'fullName email');
    await checklist.populate('items.completedBy', 'fullName email');
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
    await inspection.populate('inspector', 'fullName email');
    if (process.env.SENDGRID_API_KEY && (riskLevel === 'High' || riskLevel === 'Critical')) {
      try {
        const project = await Project.findById(projectId).select('projectManager projectName');
        if (project?.projectManager) {
          const manager = await User.findById(project.projectManager).select('email fullName');
          if (manager?.email) {
            await sendEmail({
              to: manager.email,
              subject: `[${riskLevel} Risk] Safety Inspection Alert — ${project.projectName}`,
              html: emailTemplates.safetyInspection(project.projectName, riskLevel, findings),
            });
          }
        }
      } catch (emailErr) {
        logger.warn('Safety inspection email failed', { emailErr });
      }
    }
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
        .populate('inspector', 'fullName email')
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
      .populate('inspector', 'fullName email')
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
      isResolved,
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
    if (isResolved !== undefined) inspection.isResolved = isResolved;
    if (attachments !== undefined) inspection.attachments = attachments;
    if (photos !== undefined) inspection.photos = photos;
    if (followUpDate !== undefined) inspection.followUpDate = followUpDate;
    if (followUpNotes !== undefined) inspection.followUpNotes = followUpNotes;
    await inspection.save();
    await inspection.populate('inspector', 'fullName email');
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
export const updateChecklistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, itemId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid checklist ID format' });
      return;
    }
    const checklist = await ComplianceChecklist.findById(id);
    if (!checklist) {
      res.status(404).json({ success: false, error: 'Checklist not found' });
      return;
    }
    const itemIndex = checklist.items.findIndex((item) => item.itemId === itemId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: 'Checklist item not found' });
      return;
    }
    const { isCompleted, notes, attachedDocuments } = req.body;
    if (isCompleted !== undefined) {
      checklist.items[itemIndex].isCompleted = isCompleted;
      if (isCompleted) {
        checklist.items[itemIndex].completedDate = new Date();
        checklist.items[itemIndex].completedBy = new mongoose.Types.ObjectId(req.user!.userId);
      } else {
        checklist.items[itemIndex].completedDate = undefined;
        checklist.items[itemIndex].completedBy = undefined;
      }
    }
    if (notes !== undefined) checklist.items[itemIndex].notes = notes;
    if (attachedDocuments !== undefined)
      checklist.items[itemIndex].attachedDocuments = attachedDocuments;
    await checklist.save();
    await checklist.populate('createdBy', 'fullName email');
    await checklist.populate('items.completedBy', 'fullName email');
    await checklist.populate('items.attachedDocuments', 'title fileUrl fileName documentType');
    res.status(200).json({ success: true, data: checklist });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
export const getProjectComplianceScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ success: false, error: 'Invalid projectId format' });
      return;
    }
    const checklists = await ComplianceChecklist.find({ projectId });
    if (!checklists.length) {
      res.status(200).json({
        success: true,
        data: {
          projectId,
          overallScore: 0,
          totalChecklists: 0,
          completedChecklists: 0,
          totalItems: 0,
          completedItems: 0,
          breakdown: [],
        },
      });
      return;
    }
    const rollups = checklists.map((c) => effectiveChecklistRollup(c));
    const totalItems = rollups.reduce((sum, r) => sum + r.totalItems, 0);
    const completedItems = rollups.reduce((sum, r) => sum + r.completedItems, 0);
    const overallScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const completedChecklists = rollups.filter((r) => r.complianceScore === 100).length;
    const breakdown = checklists.map((c, i) => ({
      checklistId: c._id,
      checklistName: c.checklistName,
      category: c.category,
      complianceScore: rollups[i].complianceScore,
      totalItems: rollups[i].totalItems,
      completedItems: rollups[i].completedItems,
      dueDate: c.dueDate,
    }));
    res.status(200).json({
      success: true,
      data: {
        projectId,
        overallScore,
        totalChecklists: checklists.length,
        completedChecklists,
        totalItems,
        completedItems,
        breakdown,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
export const getHighRiskInspections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ success: false, error: 'Invalid projectId format' });
      return;
    }
    const inspections = await SafetyInspection.find({
      projectId,
      riskLevel: { $in: ['High', 'Critical'] },
      isResolved: false,
    })
      .populate('inspector', 'fullName email')
      .sort({ inspectionDate: -1 });
    res.status(200).json({ success: true, data: inspections, count: inspections.length });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
