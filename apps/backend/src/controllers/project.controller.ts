import { Request, Response } from 'express';
import Project from '../models/Project';
import Milestone from '../models/Milestone';

/**
 * Project Controller
 * Handles all project-related operations
 */

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectData = req.body;
    const userId = (req as any).user.userId;
    
    // Set createdBy
    projectData.createdBy = userId;
    
    // Fallback projectManager to the user creating it if not provided
    if (!projectData.projectManager) {
      projectData.projectManager = userId;
    }

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error creating project',
    });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const query: any = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.projectName = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.manager) {
      query.projectManager = req.query.manager;
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .skip(skip)
      .limit(limit)
      .populate('projectManager', 'firstName lastName email')
      .sort({ createdAt: -1 });

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
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

    // Get milestones for the project
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ targetDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        milestones
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error updating project',
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
    
    // Also delete associated milestones
    await Milestone.deleteMany({ projectId: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

export const addMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    const milestoneData = {
      ...req.body,
      projectId: req.params.id,
    };
    
    const milestone = await Milestone.create(milestoneData);
    
    res.status(201).json({
      success: true,
      data: milestone,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error adding milestone',
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
    
    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error updating milestone',
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};
