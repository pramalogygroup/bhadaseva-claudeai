import mongoose, { Schema, Document, Model } from "mongoose";

export type UnitStatus = "vacant" | "occupied" | "maintenance";

export interface IUnit extends Document {
  propertyId: mongoose.Types.ObjectId;
  unitNumber: string;
  floor?: number;
  rentAmount: number;
  deposit: number;
  status: UnitStatus;
  isFurnished: boolean;
  area?: number;
  photos: string[];
  currentLeaseId?: mongoose.Types.ObjectId;
  isPublicListing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unitNumber: { type: String, required: true },
    floor: { type: Number },
    rentAmount: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["vacant", "occupied", "maintenance"],
      default: "vacant",
    },
    isFurnished: { type: Boolean, default: false },
    area: { type: Number },
    photos: { type: [String], default: [] },
    currentLeaseId: { type: Schema.Types.ObjectId, ref: "Lease" },
    isPublicListing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UnitSchema.index({ propertyId: 1 });
UnitSchema.index({ status: 1 });

export default (mongoose.models.Unit as Model<IUnit>) ||
  mongoose.model<IUnit>("Unit", UnitSchema);
