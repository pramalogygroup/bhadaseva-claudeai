import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITenantProfile extends Document {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  occupation?: string;
  employerName?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  citizenshipNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantProfileSchema = new Schema<ITenantProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    displayName: { type: String, required: true },
    occupation: { type: String },
    employerName: { type: String },
    permanentAddress: { type: String },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    citizenshipNumber: { type: String },
  },
  { timestamps: true }
);

export default (mongoose.models.TenantProfile as Model<ITenantProfile>) ||
  mongoose.model<ITenantProfile>("TenantProfile", TenantProfileSchema);
