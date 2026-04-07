import mongoose, { Document, Schema, Model } from 'mongoose';
export enum DocumentType {
  BLUEPRINT = 'Blueprint',
  PERMIT = 'Permit',
  CERTIFICATE = 'Certificate',
  SAFETY_REPORT = 'Safety Report',
  CONTRACT = 'Contract',
  OTHER = 'Other',
}
export enum DocumentStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}
export enum AccessAction {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
}
interface IPreviousVersion {
  version: string;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
}
interface IAccessLog {
  userId: mongoose.Types.ObjectId;
  action: AccessAction;
  timestamp: Date;
}
export interface IDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileUrl: string;
  cloudinaryId?: string;
  fileName?: string;
  fileSize?: number;
  fileFormat?: string;
  version: string;
  previousVersions: IPreviousVersion[];
  status: DocumentStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
  uploadedBy: mongoose.Types.ObjectId;
  tags: string[];
  accessLog: IAccessLog[];
  createdAt: Date;
  updatedAt: Date;
  addAccessLog(userId: mongoose.Types.ObjectId, action: AccessAction): void;
  createNewVersion(fileUrl: string, uploadedBy: mongoose.Types.ObjectId): void;
}
const previousVersionSchema = new Schema<IPreviousVersion>(
  {
    version: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { _id: false }
);
const accessLogSchema = new Schema<IAccessLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(AccessAction),
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);
const documentSchema = new Schema<IDocument>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: [true, 'Document type is required'],
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    cloudinaryId: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
      min: [0, 'File size must be positive'],
    },
    fileFormat: {
      type: String,
    },
    version: {
      type: String,
      default: '1.0',
    },
    previousVersions: [previousVersionSchema],
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.UNDER_REVIEW,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    accessLog: [accessLogSchema],
  },
  {
    timestamps: true,
  }
);
documentSchema.index({ projectId: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.pre('save', async function () {
  if (this.isModified('status') && this.status === DocumentStatus.APPROVED) {
    if (!this.approvalDate) {
      this.approvalDate = new Date();
    }
  }
});
documentSchema.methods.addAccessLog = function (
  userId: mongoose.Types.ObjectId,
  action: AccessAction
) {
  this.accessLog.push({
    userId,
    action,
    timestamp: new Date(),
  });
  return this.save();
};
documentSchema.methods.createNewVersion = function (
  fileUrl: string,
  uploadedBy: mongoose.Types.ObjectId
) {
  this.previousVersions.push({
    version: this.version,
    fileUrl: this.fileUrl,
    uploadedAt: new Date(),
    uploadedBy: this.uploadedBy,
  });
  const versionParts = this.version.split('.');
  const majorVersion = parseInt(versionParts[0]);
  const minorVersion = parseInt(versionParts[1] || '0');
  this.version = `${majorVersion}.${minorVersion + 1}`;
  this.fileUrl = fileUrl;
  this.uploadedBy = uploadedBy;
  this.status = DocumentStatus.UNDER_REVIEW;
  return this.save();
};
const DocumentModel: Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema);
export default DocumentModel;
