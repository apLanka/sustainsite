import mongoose, { Document, Schema, Model } from 'mongoose';
export enum ScoreCategory {
  RED = 'Red',
  YELLOW = 'Yellow',
  GREEN = 'Green',
}
interface ICarbonEmissions {
  transportation: number;
  equipment: number;
  materials: number;
  total: number;
}
interface IEnergyConsumption {
  electricity: number;
  diesel: number;
  renewableEnergy: number;
  total: number;
}
interface IWasteManagement {
  recyclable: number;
  nonRecyclable: number;
  hazardous: number;
  total: number;
  diversionRate: number;
}
interface IWaterUsage {
  municipal: number;
  recycled: number;
  total: number;
}
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
const carbonEmissionsSchema = new Schema<ICarbonEmissions>(
  {
    transportation: { type: Number, default: 0, min: 0 },
    equipment: { type: Number, default: 0, min: 0 },
    materials: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);
const energyConsumptionSchema = new Schema<IEnergyConsumption>(
  {
    electricity: { type: Number, default: 0, min: 0 },
    diesel: { type: Number, default: 0, min: 0 },
    renewableEnergy: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);
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
const waterUsageSchema = new Schema<IWaterUsage>(
  {
    municipal: { type: Number, default: 0, min: 0 },
    recycled: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);
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
sustainabilityMetricSchema.index({ projectId: 1 });
sustainabilityMetricSchema.index({ recordedDate: -1 });
sustainabilityMetricSchema.index({ sustainabilityScore: -1 });
sustainabilityMetricSchema.pre('save', async function () {
  this.carbonEmissions.total =
    this.carbonEmissions.transportation +
    this.carbonEmissions.equipment +
    this.carbonEmissions.materials;
  this.energyConsumption.total =
    this.energyConsumption.electricity +
    this.energyConsumption.diesel +
    this.energyConsumption.renewableEnergy;
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
  this.waterUsage.total = this.waterUsage.municipal + this.waterUsage.recycled;
  const carbonScore = calculateCarbonScore(this.carbonEmissions.total);
  const energyScore = calculateEnergyScore(
    this.energyConsumption.electricity,
    this.energyConsumption.renewableEnergy
  );
  const wasteScore = this.wasteManagement.diversionRate;
  const waterScore = calculateWaterScore(this.waterUsage.municipal, this.waterUsage.recycled);
  this.sustainabilityScore = Math.round(
    carbonScore * 0.3 + energyScore * 0.25 + wasteScore * 0.25 + waterScore * 0.2
  );
  this.treesEquivalent = Math.round(this.carbonEmissions.total * 54.4);
  if (this.sustainabilityScore < 50) {
    this.scoreCategory = ScoreCategory.RED;
  } else if (this.sustainabilityScore < 75) {
    this.scoreCategory = ScoreCategory.YELLOW;
  } else {
    this.scoreCategory = ScoreCategory.GREEN;
  }
});
function calculateCarbonScore(totalCarbon: number): number {
  if (totalCarbon <= 2) return 100;
  if (totalCarbon >= 10) return 0;
  return Math.round(100 - ((totalCarbon - 2) / 8) * 100);
}
function calculateEnergyScore(electricity: number, renewableEnergy: number): number {
  const totalEnergy = electricity + renewableEnergy;
  if (totalEnergy === 0) return 50;
  const renewablePercentage = (renewableEnergy / totalEnergy) * 100;
  return Math.round(renewablePercentage);
}
function calculateWaterScore(municipal: number, recycled: number): number {
  const totalWater = municipal + recycled;
  if (totalWater === 0) return 50;
  const recycledPercentage = (recycled / totalWater) * 100;
  return Math.round(recycledPercentage);
}
const SustainabilityMetric: Model<ISustainabilityMetric> = mongoose.model<ISustainabilityMetric>(
  'SustainabilityMetric',
  sustainabilityMetricSchema
);
export default SustainabilityMetric;
