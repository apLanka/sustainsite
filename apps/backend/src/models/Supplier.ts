import mongoose, { Document, Schema, Model } from 'mongoose';

// Nested interfaces
interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface IRating {
  ratedBy: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  ratedDate: Date;
}

// Supplier interface
export interface ISupplier extends Document {
  companyName: string;
  registrationNumber?: string;
  vatNumber?: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  address: IAddress;
  materialsSupplied: string[];
  servicesProvided: string[];
  paymentTerms?: string;
  deliveryLeadTime?: number;
  totalOrders: number;
  completedOrders: number;
  onTimeDeliveryRate: number;
  averageRating: number;
  ratings: IRating[];
  isSustainabilityCertified: boolean;
  certifications: string[];
  sustainabilityScore?: number;
  isActive: boolean;
  isPreferred: boolean;
  blacklisted: boolean;
  blacklistReason?: string;
  addedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  addRating(
    ratedBy: mongoose.Types.ObjectId,
    rating: number,
    comment?: string
  ): Promise<ISupplier>;
  updatePerformanceMetrics(
    onTimeDelivery: boolean
  ): Promise<ISupplier>;
}

// Address schema
const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false }
);

// Rating schema
const ratingSchema = new Schema<IRating>(
  {
    ratedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    comment: {
      type: String,
      trim: true,
    },
    ratedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Supplier schema
const supplierSchema = new Schema<ISupplier>(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    vatNumber: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    alternatePhone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    address: {
      type: addressSchema,
    },
    materialsSupplied: [
      {
        type: String,
        trim: true,
      },
    ],
    servicesProvided: [
      {
        type: String,
        trim: true,
      },
    ],
    paymentTerms: {
      type: String,
      trim: true,
    },
    deliveryLeadTime: {
      type: Number,
      min: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: [0, 'On-time delivery rate must be between 0 and 100'],
      max: [100, 'On-time delivery rate must be between 0 and 100'],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating must be between 0 and 5'],
      max: [5, 'Average rating must be between 0 and 5'],
    },
    ratings: [ratingSchema],
    isSustainabilityCertified: {
      type: Boolean,
      default: false,
    },
    certifications: [
      {
        type: String,
        trim: true,
      },
    ],
    sustainabilityScore: {
      type: Number,
      min: [0, 'Sustainability score must be between 0 and 10'],
      max: [10, 'Sustainability score must be between 0 and 10'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPreferred: {
      type: Boolean,
      default: false,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    blacklistReason: {
      type: String,
      trim: true,
    },
    addedBy: {
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

// Indexes
supplierSchema.index({ companyName: 1 }, { unique: true });
supplierSchema.index({ email: 1 });
supplierSchema.index({ isActive: 1 });
supplierSchema.index({ averageRating: -1 });

// Pre-save hook: Calculate average rating
supplierSchema.pre('save', async function () {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce(
      (sum, rating) => sum + rating.rating,
      0
    );
    this.averageRating = parseFloat(
      (totalRating / this.ratings.length).toFixed(2)
    );
  } else {
    this.averageRating = 0;
  }
});

// Instance method: Add rating
supplierSchema.methods.addRating = async function (
  ratedBy: mongoose.Types.ObjectId,
  rating: number,
  comment?: string
): Promise<ISupplier> {
  this.ratings.push({
    ratedBy,
    rating,
    comment,
    ratedDate: new Date(),
  });

  return this.save(); // Pre-save hook will recalculate average
};

// Instance method: Update performance metrics
supplierSchema.methods.updatePerformanceMetrics = async function (
  onTimeDelivery: boolean
): Promise<ISupplier> {
  this.totalOrders += 1;
  this.completedOrders += 1;

  // Recalculate on-time delivery rate
  const onTimeCount = onTimeDelivery
    ? Math.round((this.onTimeDeliveryRate / 100) * (this.completedOrders - 1)) +
      1
    : Math.round((this.onTimeDeliveryRate / 100) * (this.completedOrders - 1));

  this.onTimeDeliveryRate = parseFloat(
    ((onTimeCount / this.completedOrders) * 100).toFixed(2)
  );

  return this.save();
};

// Create and export Supplier model
const Supplier: Model<ISupplier> = mongoose.model<ISupplier>(
  'Supplier',
  supplierSchema
);

export default Supplier;
