import mongoose, { Schema, Document, Model } from "mongoose";

export type LeaseStatus = "active" | "terminated" | "expired";

export interface ILease extends Document {
  unitId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  ownerProfileId: mongoose.Types.ObjectId;
  tenantProfileId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  monthlyRent: number;
  depositAmount: number;
  rentDueDay: number;
  status: LeaseStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaseSchema = new Schema<ILease>(
  {
    unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    ownerProfileId: {
      type: Schema.Types.ObjectId,
      ref: "OwnerProfile",
      required: true,
    },
    tenantProfileId: {
      type: Schema.Types.ObjectId,
      ref: "TenantProfile",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    monthlyRent: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    rentDueDay: { type: Number, min: 1, max: 28, default: 1 },
    status: {
      type: String,
      enum: ["active", "terminated", "expired"],
      default: "active",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

LeaseSchema.index({ ownerProfileId: 1, status: 1 });
LeaseSchema.index({ tenantProfileId: 1, status: 1 });
LeaseSchema.index({ unitId: 1 });

export default (mongoose.models.Lease as Model<ILease>) ||
  mongoose.model<ILease>("Lease", LeaseSchema);
