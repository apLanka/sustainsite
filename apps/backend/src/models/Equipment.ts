import mongoose, { Document, Schema, Model } from 'mongoose';
export enum EquipmentType {
    EXCAVATOR = 'Excavator',
    CRANE = 'Crane',
    BULLDOZER = 'Bulldozer',
    MIXER = 'Mixer',
    LOADER = 'Loader',
    OTHER = 'Other'
}
export enum EquipmentStatus {
    AVAILABLE = 'Available',
    IN_USE = 'In Use',
    UNDER_MAINTENANCE = 'Under Maintenance',
    DAMAGED = 'Damaged',
    RETIRED = 'Retired'
}
export enum MaintenanceType {
    ROUTINE = 'Routine',
    REPAIR = 'Repair',
    OVERHAUL = 'Overhaul'
}
export interface IMaintenanceRecord {
    maintenanceDate: Date;
    maintenanceType: MaintenanceType;
    description?: string;
    cost?: number;
    performedBy?: string;
    nextMaintenanceDate?: Date;
}
interface IAssignmentRecord {
    projectId: mongoose.Types.ObjectId;
    assignedDate: Date;
    returnedDate?: Date;
    operatorId?: mongoose.Types.ObjectId;
    hoursUsed?: number;
    fuelConsumed?: number;
}
export interface IEquipment extends Document {
    equipmentName: string;
    equipmentType: EquipmentType;
    serialNumber?: string;
    assetId?: string;
    manufacturer?: string;
    equipmentModel?: string;
    yearOfManufacture?: number;
    currentProjectId?: mongoose.Types.ObjectId;
    assignedTo?: mongoose.Types.ObjectId;
    status: EquipmentStatus;
    lastMaintenanceDate?: Date;
    nextScheduledMaintenance?: Date;
    maintenanceHistory: IMaintenanceRecord[];
    assignmentHistory: IAssignmentRecord[];
    purchasePrice?: number;
    currentValue?: number;
    depreciationRate?: number;
    rentalRatePerDay?: number;
    currentLocation?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    scheduleNextMaintenance(months: number): void;
    assignToProject(projectId: mongoose.Types.ObjectId, operatorId?: mongoose.Types.ObjectId): Promise<IEquipment>;
}
const maintenanceRecordSchema = new Schema<IMaintenanceRecord>({
    maintenanceDate: {
        type: Date,
        required: true,
    },
    maintenanceType: {
        type: String,
        enum: Object.values(MaintenanceType),
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    cost: {
        type: Number,
        min: 0,
    },
    performedBy: {
        type: String,
        trim: true,
    },
    nextMaintenanceDate: {
        type: Date,
    },
}, { _id: false });
const assignmentRecordSchema = new Schema<IAssignmentRecord>({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    assignedDate: {
        type: Date,
        default: Date.now,
    },
    returnedDate: {
        type: Date,
    },
    operatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    hoursUsed: {
        type: Number,
        min: 0,
    },
    fuelConsumed: {
        type: Number,
        min: 0,
    },
}, { _id: false });
const equipmentSchema = new Schema<IEquipment>({
    equipmentName: {
        type: String,
        required: [true, 'Equipment name is required'],
        trim: true,
        minlength: [2, 'Equipment name must be at least 2 characters'],
        maxlength: [200, 'Equipment name cannot exceed 200 characters'],
    },
    equipmentType: {
        type: String,
        enum: Object.values(EquipmentType),
        required: [true, 'Equipment type is required'],
    },
    serialNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    assetId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    manufacturer: {
        type: String,
        trim: true,
    },
    equipmentModel: {
        type: String,
        trim: true,
    },
    yearOfManufacture: {
        type: Number,
        min: [1900, 'Year must be after 1900'],
        max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    currentProjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: Object.values(EquipmentStatus),
        default: EquipmentStatus.AVAILABLE,
    },
    lastMaintenanceDate: {
        type: Date,
    },
    nextScheduledMaintenance: {
        type: Date,
    },
    maintenanceHistory: [maintenanceRecordSchema],
    assignmentHistory: [assignmentRecordSchema],
    purchasePrice: {
        type: Number,
        min: 0,
    },
    currentValue: {
        type: Number,
        min: 0,
    },
    depreciationRate: {
        type: Number,
        min: 0,
        max: 100,
    },
    rentalRatePerDay: {
        type: Number,
        min: 0,
    },
    currentLocation: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ currentProjectId: 1 });
equipmentSchema.index({ nextScheduledMaintenance: 1 });
equipmentSchema.methods.scheduleNextMaintenance = function (months: number) {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + months);
    this.nextScheduledMaintenance = nextDate;
};
equipmentSchema.methods.assignToProject = async function (projectId: mongoose.Types.ObjectId, operatorId?: mongoose.Types.ObjectId): Promise<IEquipment> {
    if (this.status !== EquipmentStatus.AVAILABLE) {
        throw new Error('Equipment is not available for assignment');
    }
    this.assignmentHistory.push({
        projectId,
        assignedDate: new Date(),
        operatorId,
    });
    this.currentProjectId = projectId;
    this.assignedTo = operatorId;
    this.status = EquipmentStatus.IN_USE;
    return this.save();
};
const Equipment: Model<IEquipment> = mongoose.model<IEquipment>('Equipment', equipmentSchema);
export default Equipment;
