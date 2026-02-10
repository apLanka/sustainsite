import mongoose, { Document, Schema, Model } from 'mongoose';

// Inspection type enum
export enum InspectionType {
  SAFETY = 'Safety',
  ENVIRONMENTAL = 'Environmental',
  QUALITY = 'Quality',
  STRUCTURAL = 'Structural',
}

// Risk level enum
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

// Action status enum
export enum ActionStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

// Issue severity enum
export enum IssueSeverity {
  MINOR = 'Minor',
  MODERATE = 'Moderate',
  MAJOR = 'Major',
}

// Nested interfaces
interface IIssueIdentified {
  issue: string;
  severity: IssueSeverity;
  location?: string;
}

interface IPhoto {
  url: string;
  caption?: string;
  uploadedAt: Date;
}

// SafetyInspection interface
export interface ISafetyInspection extends Document {
  projectId: mongoose.Types.ObjectId;
  inspectionType?: InspectionType;
  inspectionDate: Date;
  inspector: mongoose.Types.ObjectId;
  inspectorNotes?: string;
  findings: string;
  riskLevel: RiskLevel;
  issuesIdentified: IIssueIdentified[];
  actionRequired?: string;
  recommendedActions: string[];
  actionDeadline?: Date;
  actionStatus: ActionStatus;
  attachments: mongoose.Types.ObjectId[];
  photos: IPhoto[];
  followUpDate?: Date;
  followUpNotes?: string;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Issue identified schema
const issueIdentifiedSchema = new Schema<IIssueIdentified>(
  {
    issue: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: Object.values(IssueSeverity),
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Photo schema
const photoSchema = new Schema<IPhoto>(
  {
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// SafetyInspection schema
const safetyInspectionSchema = new Schema<ISafetyInspection>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    inspectionType: {
      type: String,
      enum: Object.values(InspectionType),
    },
    inspectionDate: {
      type: Date,
      required: [true, 'Inspection date is required'],
    },
    inspector: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector is required'],
    },
    inspectorNotes: {
      type: String,
      trim: true,
    },
    findings: {
      type: String,
      required: [true, 'Findings are required'],
      trim: true,
    },
    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: [true, 'Risk level is required'],
    },
    issuesIdentified: [issueIdentifiedSchema],
    actionRequired: {
      type: String,
      trim: true,
    },
    recommendedActions: [
      {
        type: String,
        trim: true,
      },
    ],
    actionDeadline: {
      type: Date,
    },
    actionStatus: {
      type: String,
      enum: Object.values(ActionStatus),
      default: ActionStatus.PENDING,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    photos: [photoSchema],
    followUpDate: {
      type: Date,
    },
    followUpNotes: {
      type: String,
      trim: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
safetyInspectionSchema.index({ projectId: 1 });
safetyInspectionSchema.index({ riskLevel: 1 });
safetyInspectionSchema.index({ inspectionDate: -1 });
safetyInspectionSchema.index({ isResolved: 1 });

// Pre-save hook: Auto-resolve when action is completed
safetyInspectionSchema.pre('save', async function () {
  if (
    this.isModified('actionStatus') &&
    this.actionStatus === ActionStatus.COMPLETED
  ) {
    this.isResolved = true;
  }
});

// Create and export SafetyInspection model
const SafetyInspection: Model<ISafetyInspection> =
  mongoose.model<ISafetyInspection>(
    'SafetyInspection',
    safetyInspectionSchema
  );

export default SafetyInspection;
