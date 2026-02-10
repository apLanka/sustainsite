import mongoose, { Document, Schema, Model } from 'mongoose';

// Compliance category enum
export enum ComplianceCategory {
  ENVIRONMENTAL = 'Environmental',
  SAFETY = 'Safety',
  BUILDING_CODE = 'Building Code',
  SUSTAINABILITY_CERTIFICATION = 'Sustainability Certification',
}

// Nested interfaces
interface IComplianceItem {
  itemId: string;
  itemName: string;
  description?: string;
  isCompleted: boolean;
  completedDate?: Date;
  completedBy?: mongoose.Types.ObjectId;
  attachedDocuments: mongoose.Types.ObjectId[];
  notes?: string;
}

// ComplianceChecklist interface
export interface IComplianceChecklist extends Document {
  projectId: mongoose.Types.ObjectId;
  checklistName: string;
  category?: ComplianceCategory;
  items: IComplianceItem[];
  totalItems: number;
  completedItems: number;
  complianceScore: number;
  createdBy?: mongoose.Types.ObjectId;
  dueDate?: Date;
  lastReviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Compliance item schema
const complianceItemSchema = new Schema<IComplianceItem>(
  {
    itemId: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    attachedDocuments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// ComplianceChecklist schema
const complianceChecklistSchema = new Schema<IComplianceChecklist>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    checklistName: {
      type: String,
      required: [true, 'Checklist name is required'],
      trim: true,
      minlength: [3, 'Checklist name must be at least 3 characters'],
      maxlength: [200, 'Checklist name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: Object.values(ComplianceCategory),
    },
    items: [complianceItemSchema],
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    complianceScore: {
      type: Number,
      default: 0,
      min: [0, 'Compliance score must be between 0 and 100'],
      max: [100, 'Compliance score must be between 0 and 100'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: {
      type: Date,
    },
    lastReviewDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
complianceChecklistSchema.index({ projectId: 1 });
complianceChecklistSchema.index({ category: 1 });
complianceChecklistSchema.index({ complianceScore: 1 });

// Pre-save hook: Calculate compliance metrics
complianceChecklistSchema.pre('save', async function () {
  // Calculate total items
  this.totalItems = this.items.length;

  // Calculate completed items
  this.completedItems = this.items.filter((item) => item.isCompleted).length;

  // Calculate compliance score
  if (this.totalItems > 0) {
    this.complianceScore = Math.round(
      (this.completedItems / this.totalItems) * 100
    );
  } else {
    this.complianceScore = 0;
  }

  // Auto-set completion date for newly completed items
  this.items.forEach((item) => {
    if (item.isCompleted && !item.completedDate) {
      item.completedDate = new Date();
    }
  });
});

// Create and export ComplianceChecklist model
const ComplianceChecklist: Model<IComplianceChecklist> =
  mongoose.model<IComplianceChecklist>(
    'ComplianceChecklist',
    complianceChecklistSchema
  );

export default ComplianceChecklist;
