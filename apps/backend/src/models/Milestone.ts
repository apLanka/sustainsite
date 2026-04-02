import mongoose, { Document, Schema, Model } from 'mongoose';
export enum MilestoneStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed'
}
export interface IMilestone extends Document {
    projectId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    targetDate: Date;
    completionDate?: Date;
    status: MilestoneStatus;
    completionPercentage: number;
    dependencies: mongoose.Types.ObjectId[];
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
const milestoneSchema = new Schema<IMilestone>({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required'],
    },
    title: {
        type: String,
        required: [true, 'Milestone title is required'],
        trim: true,
        minlength: [3, 'Milestone title must be at least 3 characters'],
        maxlength: [200, 'Milestone title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    targetDate: {
        type: Date,
        required: [true, 'Target date is required'],
    },
    completionDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: Object.values(MilestoneStatus),
        default: MilestoneStatus.PENDING,
    },
    completionPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Completion percentage must be between 0 and 100'],
        max: [100, 'Completion percentage must be between 0 and 100'],
    },
    dependencies: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Milestone',
        },
    ],
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
milestoneSchema.index({ projectId: 1 });
milestoneSchema.index({ status: 1 });
milestoneSchema.index({ targetDate: 1 });
milestoneSchema.pre('save', async function () {
    if (this.isModified('status') && this.status === MilestoneStatus.COMPLETED) {
        if (!this.completionDate) {
            this.completionDate = new Date();
        }
        if (this.completionPercentage < 100) {
            this.completionPercentage = 100;
        }
    }
});
const Milestone: Model<IMilestone> = mongoose.model<IMilestone>('Milestone', milestoneSchema);
export default Milestone;
