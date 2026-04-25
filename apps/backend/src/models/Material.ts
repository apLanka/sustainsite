import mongoose, { Document, Schema, Model } from 'mongoose';
export enum MaterialCategory {
  CEMENT = 'Cement',
  STEEL = 'Steel',
  WOOD = 'Wood',
  AGGREGATES = 'Aggregates',
  BRICKS = 'Bricks',
  EQUIPMENT = 'Equipment',
  OTHER = 'Other',
}
export enum MaterialStatus {
  ORDERED = 'Ordered',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  IN_STOCK = 'In Stock',
  USED = 'Used',
  CANCELLED = 'Cancelled',
}
interface IUsageHistory {
  usedQuantity: number;
  usedDate: Date;
  usedBy: mongoose.Types.ObjectId;
  purpose?: string;
  notes?: string;
}
export interface IMaterial extends Document {
  projectId: mongoose.Types.ObjectId;
  materialName: string;
  category: MaterialCategory;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  supplier: mongoose.Types.ObjectId;
  purchaseOrderNumber?: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: MaterialStatus;
  currentStock: number;
  minimumThreshold: number;
  suggestedReorderQuantity?: number;
  usageHistory: IUsageHistory[];
  sustainabilityRating?: number;
  isEcoFriendly: boolean;
  recycledContent: number;
  certifications: string[];
  createdBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  checkLowStock(): boolean;
  recordUsage(
    quantity: number,
    usedBy: mongoose.Types.ObjectId,
    purpose?: string
  ): Promise<IMaterial>;
}
const usageHistorySchema = new Schema<IUsageHistory>(
  {
    usedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    usedDate: {
      type: Date,
      default: Date.now,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);
const materialSchema = new Schema<IMaterial>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      minlength: [2, 'Material name must be at least 2 characters'],
      maxlength: [200, 'Material name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: Object.values(MaterialCategory),
      required: [true, 'Material category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price must be positive'],
    },
    totalCost: {
      type: Number,
      min: 0,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    purchaseOrderNumber: {
      type: String,
      trim: true,
    },
    orderDate: {
      type: Date,
      required: [true, 'Order date is required'],
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(MaterialStatus),
      default: MaterialStatus.ORDERED,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },
    suggestedReorderQuantity: {
      type: Number,
      min: 0,
    },
    usageHistory: [usageHistorySchema],
    sustainabilityRating: {
      type: Number,
      min: [0, 'Sustainability rating must be between 0 and 10'],
      max: [10, 'Sustainability rating must be between 0 and 10'],
    },
    isEcoFriendly: {
      type: Boolean,
      default: false,
    },
    recycledContent: {
      type: Number,
      default: 0,
      min: [0, 'Recycled content must be between 0 and 100'],
      max: [100, 'Recycled content must be between 0 and 100'],
    },
    certifications: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
materialSchema.index({ projectId: 1 });
materialSchema.index({ status: 1 });
materialSchema.index({ supplier: 1 });
materialSchema.index({ currentStock: 1 });
materialSchema.pre('save', async function () {
  this.totalCost = this.quantity * this.unitPrice;
  if (
    this.isModified('status') &&
    this.status === MaterialStatus.DELIVERED &&
    this.currentStock === 0
  ) {
    this.currentStock = this.quantity;
  }
});
materialSchema.methods.checkLowStock = function (): boolean {
  return this.currentStock < this.minimumThreshold;
};
materialSchema.methods.recordUsage = async function (
  quantity: number,
  usedBy: mongoose.Types.ObjectId,
  purpose?: string
): Promise<IMaterial> {
  if (quantity > this.currentStock) {
    throw new Error('Insufficient stock for this usage');
  }
  this.usageHistory.push({
    usedQuantity: quantity,
    usedDate: new Date(),
    usedBy,
    purpose,
  });
  this.currentStock -= quantity;
  if (this.currentStock === 0) {
    this.status = MaterialStatus.USED;
  }
  return this.save();
};
const Material: Model<IMaterial> = mongoose.model<IMaterial>('Material', materialSchema);
export default Material;
