import mongoose, { Document, Schema, Model } from 'mongoose';

export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
}

interface ILocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface IProject extends Document {
  projectName: string;
  description?: string;
  location: ILocation;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  budget: number;
  actualCost: number;
  projectManager: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  sustainabilityScore: number;
  currentPhase?: string;
  completionPercentage: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  daysRemaining?: number;
  budgetVariance?: number;
}

const locationSchema = new Schema<ILocation>(
  {
    address: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [3, 'Project name must be at least 3 characters'],
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PLANNING,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget must be a positive number'],
    },
    actualCost: {
      type: Number,
      default: 0,
      min: [0, 'Actual cost must be a positive number'],
    },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project manager is required'],
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    sustainabilityScore: {
      type: Number,
      default: 0,
      min: [0, 'Sustainability score must be between 0 and 100'],
      max: [100, 'Sustainability score must be between 0 and 100'],
    },
    currentPhase: {
      type: String,
      trim: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Completion percentage must be between 0 and 100'],
      max: [100, 'Completion percentage must be between 0 and 100'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ projectManager: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: -1 });

projectSchema.virtual('daysRemaining').get(function (this: IProject) {
  if (this.status === ProjectStatus.COMPLETED) {
    return 0;
  }
  const today = new Date();
  const end = new Date(this.endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

projectSchema.virtual('budgetVariance').get(function (this: IProject) {
  return this.budget - this.actualCost;
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);

export default Project;
