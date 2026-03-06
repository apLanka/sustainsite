import { Request, Response } from 'express';
import SustainabilityMetric from '../models/SustainabilityMetric';
import Project from '../models/Project';

export const createMetric = async (req: Request, res: Response): Promise<void> => {
  try {
    const metricData = req.body;
    metricData.recordedBy = (req as unknown as { user: { userId: string } }).user.userId;

    const metric = await SustainabilityMetric.create(metricData);

    const project = await Project.findById(metric.projectId);
    if (project) {
      project.sustainabilityScore = metric.sustainabilityScore;
      await project.save({ validateBeforeSave: false });
    }

    res.status(201).json({
      success: true,
      data: metric,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error creating metric',
    });
  }
};

export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    const total = await SustainabilityMetric.countDocuments(query);
    const metrics = await SustainabilityMetric.find(query)
      .skip(skip)
      .limit(limit)
      .populate('recordedBy', 'firstName lastName')
      .populate('projectId', 'projectName')
      .sort({ recordedDate: -1 });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: metrics,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getMetricById = async (req: Request, res: Response): Promise<void> => {
  try {
    const metric = await SustainabilityMetric.findById(req.params.id)
      .populate('recordedBy', 'firstName lastName email')
      .populate('projectId', 'projectName status');

    if (!metric) {
      res.status(404).json({
        success: false,
        error: 'Metric not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: metric,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const updateMetric = async (req: Request, res: Response): Promise<void> => {
  try {

    const metric = await SustainabilityMetric.findById(req.params.id);

    if (!metric) {
      res.status(404).json({
        success: false,
        error: 'Metric not found',
      });
      return;
    }

    if (req.body.carbonEmissions) metric.carbonEmissions = { ...metric.carbonEmissions, ...req.body.carbonEmissions };
    if (req.body.energyConsumption) metric.energyConsumption = { ...metric.energyConsumption, ...req.body.energyConsumption };
    if (req.body.wasteManagement) metric.wasteManagement = { ...metric.wasteManagement, ...req.body.wasteManagement };
    if (req.body.waterUsage) metric.waterUsage = { ...metric.waterUsage, ...req.body.waterUsage };
    if (req.body.notes !== undefined) metric.notes = req.body.notes;

    await metric.save();

    const project = await Project.findById(metric.projectId);
    if (project) {
      project.sustainabilityScore = metric.sustainabilityScore;
      await project.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      data: metric,
    });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error updating metric',
    });
  }
};

export const deleteMetric = async (req: Request, res: Response): Promise<void> => {
  try {
    const metric = await SustainabilityMetric.findByIdAndDelete(req.params.id);

    if (!metric) {
      res.status(404).json({
        success: false,
        error: 'Metric not found',
      });
      return;
    }

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

export const getProjectMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await SustainabilityMetric.find({ projectId: req.params.projectId })
      .populate('recordedBy', 'firstName lastName')
      .sort({ recordedDate: -1 });

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getLatestProjectMetric = async (req: Request, res: Response): Promise<void> => {
  try {
    const metric = await SustainabilityMetric.findOne({ projectId: req.params.projectId })
      .populate('recordedBy', 'firstName lastName')
      .sort({ recordedDate: -1 });

    if (!metric) {
      res.status(404).json({
        success: false,
        error: 'No metrics found for this project',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: metric,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getProjectSustainabilityScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId).select('sustainabilityScore projectName');

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        projectId: project._id,
        projectName: project.projectName,
        sustainabilityScore: project.sustainabilityScore,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getProjectTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const metrics = await SustainabilityMetric.find({ projectId: req.params.projectId })
      .select('sustainabilityScore treesEquivalent wasteManagement.diversionRate recordedDate')
      .sort({ recordedDate: 1 });

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const calculateImpact = async (req: Request, res: Response): Promise<void> => {
  try {

    const { carbonEmissions, energyConsumption } = req.body;

    const totalCarbon = (carbonEmissions?.transportation || 0) +
                        (carbonEmissions?.equipment || 0) +
                        (carbonEmissions?.materials || 0);

    const treesEquivalent = Math.round(totalCarbon * 54.4);

    const electricity = energyConsumption?.electricity || 0;
    const renewableEnergy = energyConsumption?.renewableEnergy || 0;
    const totalEnergy = electricity + renewableEnergy;
    const renewablePercentage = totalEnergy > 0 ? (renewableEnergy / totalEnergy) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalCarbon,
        treesEquivalent,
        renewablePercentage: Math.round(renewablePercentage),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
