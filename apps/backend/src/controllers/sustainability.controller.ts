import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SustainabilityMetric from '../models/SustainabilityMetric';
import Project from '../models/Project';
const INDUSTRY_BENCHMARKS = {
  average: 65,
  good: 75,
  excellent: 85,
  carbonAvgTonsPerWeek: 6,
  energyAvgKwhPerWeek: 3000,
  wasteAvgKgPerWeek: 1200,
  waterAvgLitersPerWeek: 18000,
};
function buildRecommendations(metric: {
  carbonEmissions: {
    total: number;
  };
  energyConsumption: {
    electricity: number;
    renewableEnergy: number;
  };
  wasteManagement: {
    diversionRate: number;
  };
  waterUsage: {
    municipal: number;
    recycled: number;
  };
  sustainabilityScore: number;
}): string[] {
  const recs: string[] = [];
  const { carbonEmissions, energyConsumption, wasteManagement, waterUsage, sustainabilityScore } =
    metric;
  if (carbonEmissions.total > INDUSTRY_BENCHMARKS.carbonAvgTonsPerWeek) {
    recs.push('Reduce diesel-powered equipment usage to lower carbon emissions.');
  }
  const totalEnergy = energyConsumption.electricity + energyConsumption.renewableEnergy;
  const renewablePct =
    totalEnergy > 0 ? (energyConsumption.renewableEnergy / totalEnergy) * 100 : 0;
  if (renewablePct < 20) {
    recs.push('Increase renewable energy usage (solar/wind) to improve energy efficiency score.');
  }
  if (wasteManagement.diversionRate < 60) {
    recs.push('Improve waste segregation to increase recyclable diversion rate above 60%.');
  }
  const totalWater = waterUsage.municipal + waterUsage.recycled;
  const recycledWaterPct = totalWater > 0 ? (waterUsage.recycled / totalWater) * 100 : 0;
  if (recycledWaterPct < 20) {
    recs.push('Incorporate recycled water sources to reduce municipal water dependency.');
  }
  if (sustainabilityScore >= INDUSTRY_BENCHMARKS.excellent) {
    recs.push('Excellent performance! Consider applying for LEED or BREEAM certification.');
  } else if (sustainabilityScore >= INDUSTRY_BENCHMARKS.good) {
    recs.push('Good performance. Focus on the weakest sub-score to reach excellent tier (85+).');
  }
  return recs;
}
export const createMetric = async (req: Request, res: Response): Promise<void> => {
  try {
    const metricData = req.body;
    metricData.recordedBy = req.user!.userId;
    const metric = await SustainabilityMetric.create(metricData);
    const project = await Project.findById(metric.projectId);
    if (project) {
      project.sustainabilityScore = metric.sustainabilityScore;
      await project.save({ validateBeforeSave: false });
    }
    res.status(201).json({ success: true, data: metric });
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
    if (req.query.projectId) query.projectId = req.query.projectId;
    const total = await SustainabilityMetric.countDocuments(query);
    const metrics = await SustainabilityMetric.find(query)
      .skip(skip)
      .limit(limit)
      .populate('recordedBy', 'fullName email')
      .populate('projectId', 'projectName')
      .sort({ recordedDate: -1 });
    res.status(200).json({
      success: true,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
      .populate('recordedBy', 'fullName email')
      .populate('projectId', 'projectName status');
    if (!metric) {
      res.status(404).json({ success: false, error: 'Metric not found' });
      return;
    }
    res.status(200).json({ success: true, data: metric });
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
      res.status(404).json({ success: false, error: 'Metric not found' });
      return;
    }
    if (req.body.carbonEmissions)
      metric.carbonEmissions = { ...metric.carbonEmissions, ...req.body.carbonEmissions };
    if (req.body.energyConsumption)
      metric.energyConsumption = { ...metric.energyConsumption, ...req.body.energyConsumption };
    if (req.body.wasteManagement)
      metric.wasteManagement = { ...metric.wasteManagement, ...req.body.wasteManagement };
    if (req.body.waterUsage) metric.waterUsage = { ...metric.waterUsage, ...req.body.waterUsage };
    if (req.body.notes !== undefined) metric.notes = req.body.notes;
    await metric.save();
    const project = await Project.findById(metric.projectId);
    if (project) {
      project.sustainabilityScore = metric.sustainabilityScore;
      await project.save({ validateBeforeSave: false });
    }
    res.status(200).json({ success: true, data: metric });
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
      res.status(404).json({ success: false, error: 'Metric not found' });
      return;
    }
    res.status(200).json({ success: true, data: {} });
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
      .populate('recordedBy', 'fullName email')
      .sort({ recordedDate: -1 });
    res.status(200).json({ success: true, data: metrics });
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
      .populate('recordedBy', 'fullName email')
      .sort({ recordedDate: -1 });
    if (!metric) {
      res.status(404).json({ success: false, error: 'No metrics found for this project' });
      return;
    }
    res.status(200).json({ success: true, data: metric });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
export const getProjectSustainabilityScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId).select(
      'sustainabilityScore projectName'
    );
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    const [latest, previous] = await SustainabilityMetric.find({ projectId: req.params.projectId })
      .sort({ recordedDate: -1 })
      .limit(2);
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (latest && previous) {
      const diff = latest.sustainabilityScore - previous.sustainabilityScore;
      if (diff > 2) trend = 'improving';
      else if (diff < -2) trend = 'declining';
    }
    let scoreBreakdown: Record<string, number> | null = null;
    let recommendations: string[] = [];
    if (latest) {
      const totalEnergy =
        latest.energyConsumption.electricity + latest.energyConsumption.renewableEnergy;
      const renewablePct =
        totalEnergy > 0 ? (latest.energyConsumption.renewableEnergy / totalEnergy) * 100 : 0;
      const totalWater = latest.waterUsage.municipal + latest.waterUsage.recycled;
      const recycledWaterPct = totalWater > 0 ? (latest.waterUsage.recycled / totalWater) * 100 : 0;
      scoreBreakdown = {
        carbonEmissions: Math.round(project.sustainabilityScore * 0.3),
        energyEfficiency: Math.round(renewablePct * 0.25),
        wasteManagement: Math.round(latest.wasteManagement.diversionRate * 0.25),
        waterConservation: Math.round(recycledWaterPct * 0.2),
      };
      recommendations = buildRecommendations(latest);
    }
    res.status(200).json({
      success: true,
      data: {
        projectId: project._id,
        projectName: project.projectName,
        currentScore: project.sustainabilityScore,
        scoreCategory:
          project.sustainabilityScore >= 75
            ? 'Green'
            : project.sustainabilityScore >= 50
              ? 'Yellow'
              : 'Red',
        scoreBreakdown,
        lastUpdated: latest?.recordedDate ?? null,
        trend,
        benchmarkComparison: {
          industryAverage: INDUSTRY_BENCHMARKS.average,
          difference: project.sustainabilityScore - INDUSTRY_BENCHMARKS.average,
        },
        recommendations,
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
    const period = parseInt(req.query.period as string, 10) || 30;
    const interval = (req.query.interval as string) || 'weekly';
    const since = new Date();
    since.setDate(since.getDate() - period);
    let dateFormat: string;
    if (interval === 'daily') dateFormat = '%Y-%m-%d';
    else if (interval === 'monthly') dateFormat = '%Y-%m';
    else dateFormat = '%G-W%V';
    const projectId = new mongoose.Types.ObjectId(req.params.projectId);
    const buckets = await SustainabilityMetric.aggregate([
      {
        $match: {
          projectId,
          recordedDate: { $gte: since },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$recordedDate' } },
          avgScore: { $avg: '$sustainabilityScore' },
          totalCarbon: { $sum: '$carbonEmissions.total' },
          totalEnergy: { $sum: '$energyConsumption.total' },
          totalWaste: { $sum: '$wasteManagement.total' },
          totalWater: { $sum: '$waterUsage.total' },
          count: { $sum: 1 },
          minDate: { $min: '$recordedDate' },
          maxDate: { $max: '$recordedDate' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const trends = buckets.map((b) => ({
      period: b._id,
      startDate: b.minDate,
      endDate: b.maxDate,
      sustainabilityScore: Math.round(b.avgScore),
      carbonEmissions: Math.round(b.totalCarbon * 100) / 100,
      energyConsumption: Math.round(b.totalEnergy),
      wasteGenerated: Math.round(b.totalWaste),
      waterUsage: Math.round(b.totalWater),
      recordCount: b.count,
    }));
    const scores = trends.map((t) => t.sustainabilityScore);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const scoreImprovement = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
    res.status(200).json({
      success: true,
      data: {
        projectId: req.params.projectId,
        period: `${period} days`,
        interval,
        trends,
        summary: {
          averageScore: avgScore,
          scoreImprovement,
          totalCarbonRecorded: trends.reduce((a, t) => a + t.carbonEmissions, 0),
          totalWasteRecorded: trends.reduce((a, t) => a + t.wasteGenerated, 0),
        },
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};
export const compareWithIndustry = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.projectId).select(
      'sustainabilityScore projectName'
    );
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }
    const score = project.sustainabilityScore;
    const diff = score - INDUSTRY_BENCHMARKS.average;
    let percentileBand: string;
    if (score >= INDUSTRY_BENCHMARKS.excellent) percentileBand = 'Top 15% (Excellent)';
    else if (score >= INDUSTRY_BENCHMARKS.good) percentileBand = 'Top 35% (Good)';
    else if (score >= INDUSTRY_BENCHMARKS.average) percentileBand = 'Above average';
    else percentileBand = 'Below average';
    const latest = await SustainabilityMetric.findOne({ projectId: req.params.projectId }).sort({
      recordedDate: -1,
    });
    const areasAboveAverage: string[] = [];
    const areasBelowAverage: string[] = [];
    if (latest) {
      const totalEnergy =
        latest.energyConsumption.electricity + latest.energyConsumption.renewableEnergy;
      const renewablePct =
        totalEnergy > 0 ? (latest.energyConsumption.renewableEnergy / totalEnergy) * 100 : 0;
      if (latest.carbonEmissions.total < INDUSTRY_BENCHMARKS.carbonAvgTonsPerWeek)
        areasAboveAverage.push('Carbon emissions');
      else areasBelowAverage.push('Carbon emissions');
      if (renewablePct > 20) areasAboveAverage.push('Renewable energy usage');
      else areasBelowAverage.push('Renewable energy usage');
      if (latest.wasteManagement.diversionRate > 60) areasAboveAverage.push('Waste diversion rate');
      else areasBelowAverage.push('Waste diversion rate');
      const totalWater = latest.waterUsage.municipal + latest.waterUsage.recycled;
      const recycledWaterPct = totalWater > 0 ? (latest.waterUsage.recycled / totalWater) * 100 : 0;
      if (recycledWaterPct > 20) areasAboveAverage.push('Water recycling');
      else areasBelowAverage.push('Water recycling');
    }
    res.status(200).json({
      success: true,
      data: {
        projectId: project._id,
        projectName: project.projectName,
        projectScore: score,
        industryAverage: INDUSTRY_BENCHMARKS.average,
        difference: diff,
        percentileBand,
        areasAboveAverage,
        areasBelowAverage,
        benchmarks: INDUSTRY_BENCHMARKS,
      },
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
    const totalCarbon =
      (carbonEmissions?.transportation || 0) +
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
