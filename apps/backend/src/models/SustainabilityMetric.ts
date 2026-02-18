import mongoose, { Document, Schema, Model } from 'mongoose';

// Score category enum
export enum ScoreCategory {
  RED = 'Red',
  YELLOW = 'Yellow',
  GREEN = 'Green',
}

// Nested interfaces
interface ICarbonEmissions {
  transportation: number;
  equipment: number;
  materials: number;
  total: number;
}

interface IEnergyConsumption {
  electricity: number; // kWh
  diesel: number; // liters
  renewableEnergy: number; // kWh
  total: number;
}

interface IWasteManagement {
  recyclable: number; // kg
  nonRecyclable: number; // kg
  hazardous: number; // kg
  total: number;
  diversionRate: number; // percentage
}

interface IWaterUsage {
  municipal: number; // liters
  recycled: number; // liters
  total: number;
}

// SustainabilityMetric interface
export interface ISustainabilityMetric extends Document {
  projectId: mongoose.Types.ObjectId;
  carbonEmissions: ICarbonEmissions;
  energyConsumption: IEnergyConsumption;
  wasteManagement: IWasteManagement;
  waterUsage: IWaterUsage;
  sustainabilityScore: number;
  treesEquivalent: number;
  scoreCategory: ScoreCategory;
  recordedDate: Date;
  recordedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Carbon emissions schema
const carbonEmissionsSchema = new Schema<ICarbonEmissions>(
  {
    transportation: { type: Number, default: 0, min: 0 },
    equipment: { type: Number, default: 0, min: 0 },
    materials: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// Energy consumption schema
const energyConsumptionSchema = new Schema<IEnergyConsumption>(
  {
    electricity: { type: Number, default: 0, min: 0 },
    diesel: { type: Number, default: 0, min: 0 },
    renewableEnergy: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// Waste management schema
const wasteManagementSchema = new Schema<IWasteManagement>(
  {
    recyclable: { type: Number, default: 0, min: 0 },
    nonRecyclable: { type: Number, default: 0, min: 0 },
    hazardous: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    diversionRate: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

// Water usage schema
const waterUsageSchema = new Schema<IWaterUsage>(
  {
    municipal: { type: Number, default: 0, min: 0 },
    recycled: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// SustainabilityMetric schema
const sustainabilityMetricSchema = new Schema<ISustainabilityMetric>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    carbonEmissions: {
      type: carbonEmissionsSchema,
      required: true,
    },
    energyConsumption: {
      type: energyConsumptionSchema,
      required: true,
    },
    wasteManagement: {
      type: wasteManagementSchema,
      required: true,
    },
    waterUsage: {
      type: waterUsageSchema,
      required: true,
    },
    sustainabilityScore: {
      type: Number,
      min: [0, 'Sustainability score must be between 0 and 100'],
      max: [100, 'Sustainability score must be between 0 and 100'],
    },
    treesEquivalent: {
      type: Number,
      min: 0,
    },
    scoreCategory: {
      type: String,
      enum: Object.values(ScoreCategory),
    },
    recordedDate: {
      type: Date,
      required: [true, 'Recorded date is required'],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
sustainabilityMetricSchema.index({ projectId: 1 });
sustainabilityMetricSchema.index({ recordedDate: -1 });
sustainabilityMetricSchema.index({ sustainabilityScore: -1 });

// Pre-save hook: Calculate totals and scores
sustainabilityMetricSchema.pre('save', async function () {
  // Calculate carbon emissions total
  this.carbonEmissions.total =
    this.carbonEmissions.transportation +
    this.carbonEmissions.equipment +
    this.carbonEmissions.materials;

  // Calculate energy consumption total
  this.energyConsumption.total =
    this.energyConsumption.electricity +
    this.energyConsumption.diesel +
    this.energyConsumption.renewableEnergy;

  // Calculate waste management total and diversion rate
  this.wasteManagement.total =
    this.wasteManagement.recyclable +
    this.wasteManagement.nonRecyclable +
    this.wasteManagement.hazardous;

  if (this.wasteManagement.total > 0) {
    this.wasteManagement.diversionRate =
      (this.wasteManagement.recyclable / this.wasteManagement.total) * 100;
  } else {
    this.wasteManagement.diversionRate = 0;
  }

  // Calculate water usage total
  this.waterUsage.total = this.waterUsage.municipal + this.waterUsage.recycled;

  // Calculate sustainability score (weighted algorithm)
  const carbonScore = calculateCarbonScore(this.carbonEmissions.total);
  const energyScore = calculateEnergyScore(
    this.energyConsumption.electricity,
    this.energyConsumption.renewableEnergy
  );
  const wasteScore = this.wasteManagement.diversionRate;
  const waterScore = calculateWaterScore(this.waterUsage.municipal, this.waterUsage.recycled);

  // Weighted scoring: Carbon 30%, Energy 25%, Waste 25%, Water 20%
  this.sustainabilityScore = Math.round(
    carbonScore * 0.3 + energyScore * 0.25 + wasteScore * 0.25 + waterScore * 0.2
  );

  // Calculate trees equivalent (1 ton CO2 = 54.4 trees)
  this.treesEquivalent = Math.round(this.carbonEmissions.total * 54.4);

  // Determine score category
  if (this.sustainabilityScore < 50) {
    this.scoreCategory = ScoreCategory.RED;
  } else if (this.sustainabilityScore < 75) {
    this.scoreCategory = ScoreCategory.YELLOW;
  } else {
    this.scoreCategory = ScoreCategory.GREEN;
  }
});

// Helper function: Calculate carbon score (lower is better)
function calculateCarbonScore(totalCarbon: number): number {
  // Benchmark: < 2 tons = 100, > 10 tons = 0
  if (totalCarbon <= 2) return 100;
  if (totalCarbon >= 10) return 0;
  return Math.round(100 - ((totalCarbon - 2) / 8) * 100);
}

// Helper function: Calculate energy score (higher renewable % is better)
function calculateEnergyScore(electricity: number, renewableEnergy: number): number {
  const totalEnergy = electricity + renewableEnergy;
  if (totalEnergy === 0) return 50; // Neutral score if no energy data
  const renewablePercentage = (renewableEnergy / totalEnergy) * 100;
  return Math.round(renewablePercentage);
}

// Helper function: Calculate water score (higher recycled % is better)
function calculateWaterScore(municipal: number, recycled: number): number {
  const totalWater = municipal + recycled;
  if (totalWater === 0) return 50; // Neutral score if no water data
  const recycledPercentage = (recycled / totalWater) * 100;
  return Math.round(recycledPercentage);
}

// Create and export SustainabilityMetric model
const SustainabilityMetric: Model<ISustainabilityMetric> = mongoose.model<ISustainabilityMetric>(
  'SustainabilityMetric',
  sustainabilityMetricSchema
);

export default SustainabilityMetric;
