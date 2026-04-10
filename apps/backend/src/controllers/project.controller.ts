import {Request, Response} from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Milestone, { MilestoneStatus } from '../models/Milestone';
import Material from '../models/Material';
import User from '../models/User';
import { sendEmail, emailTemplates } from '../config/email';
import logger from '../utils/logger';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectData = req.body;
    const userId = (req as unknown as { user: { userId: string } }).user.userId;

    projectData.createdBy = userId;

    if (!projectData.projectManager) {
      projectData.projectManager = userId;
    }

    const project = await Project.create(projectData);

    // Email notification to assigned project manager
    if (process.env.SENDGRID_API_KEY) {
      try {
        const manager = await User.findById(project.projectManager).select('email fullName');
        if (manager?.email) {
          await sendEmail({
            to: manager.email,
            subject: `New Project Assigned: ${project.projectName}`,
            html: emailTemplates.projectCreated(project.projectName, manager.fullName),
          });
        }
      } catch (emailErr) {
        logger.warn('Project creation email failed', { emailErr });
      }
    }

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error creating project',
    });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.manager) {
      query.projectManager = req.query.manager;
    }

    const searchTerm = (req.query.search as string)?.trim();
    let isTextSearch = false;

    if (searchTerm) {
      if (mongoose.Types.ObjectId.isValid(searchTerm)) {
        // Exact lookup by project _id
        query._id = new mongoose.Types.ObjectId(searchTerm);
      } else {
        // Full-text search across projectName + description
        query.$text = { $search: searchTerm };
        isTextSearch = true;
      }
    }

    const projection = isTextSearch ? { score: { $meta: 'textScore' } } : {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: Record<string, any> = isTextSearch
      ? { score: { $meta: 'textScore' } }
      : { createdAt: -1 };

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query, projection)
      .skip(skip)
      .limit(limit)
      .populate('projectManager', 'firstName lastName email')
      .sort(sort);

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: projects,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectManager', 'firstName lastName email')
      .populate('teamMembers', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        milestones
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error updating project',
    });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    await Milestone.deleteMany({ projectId: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

// Recalculates and persists a project's completionPercentage from its milestones.
async function syncProjectCompletion(projectId: string): Promise<void> {
  const milestones = await Milestone.find({ projectId });
  if (milestones.length === 0) return;
  const total = milestones.reduce((sum, m) => {
    const pct = m.status === MilestoneStatus.COMPLETED ? 100 : m.completionPercentage;
    return sum + pct;
  }, 0);
  await Project.findByIdAndUpdate(projectId, {
    completionPercentage: Math.round(total / milestones.length),
  });
}

export const addMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const milestoneData = {
      ...req.body,
      projectId: req.params.id,
    };

    const milestone = await Milestone.create(milestoneData);
    await syncProjectCompletion(req.params.id);

    res.status(201).json({
      success: true,
      data: milestone,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error adding milestone',
    });
  }
};

export const updateMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const milestone = await Milestone.findOneAndUpdate(
      { _id: req.params.milestoneId, projectId: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!milestone) {
      res.status(404).json({
        success: false,
        error: 'Milestone not found for this project',
      });
      return;
    }

    await syncProjectCompletion(req.params.id);

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error updating milestone',
    });
  }
};

export const getProjectTimeline = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id).select('projectName startDate endDate status');

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    const milestones = await Milestone.find({ projectId: req.params.id })
      .select('title targetDate completionDate status completionPercentage')
      .sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        project,
        milestones,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getFinancialSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const {id} = req.params;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({success: false, error: 'Project not found'});
      return;
    }

    const materials = await Material.find({projectId: id});

    const totalMaterialCost = materials.reduce(
      (sum, mat) => sum + (Number(mat.totalCost) || 0),
      0
    );
    const totalSpendSafe = Number.isFinite(totalMaterialCost) ? totalMaterialCost : 0;
    const remainingValue = materials.reduce(
      (sum, mat) => sum + (Number(mat.currentStock) || 0) * (Number(mat.unitPrice) || 0),
      0
    );

    // Calculate allocation by category
    const allocationByCategory: Record<string, number> = {};
    materials.forEach(mat => {
      if (!allocationByCategory[mat.category]) {
        allocationByCategory[mat.category] = 0;
      }
      allocationByCategory[mat.category] += Number(mat.totalCost) || 0;
    });

    // Convert to percentage breakdown
    const totalSpend = totalSpendSafe;
    const allocationMix = Object.entries(allocationByCategory).map(([category, cost]) => ({
      category,
      cost,
      percentage: totalSpend > 0 ? (cost / totalSpend) * 100 : 0,
    }));

    const budget = Number(project.budget) || 0;
    const remainingBudget = budget - totalSpendSafe;
    const spendPercentage =
      budget > 0 && Number.isFinite(totalSpendSafe) ? (totalSpendSafe / budget) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        projectId: id,
        projectName: project.projectName,
        budget,
        totalSpend,
        remainingBudget,
        spendPercentage,
        remainingValue,
        materialCount: materials.length,
        allocationMix,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
