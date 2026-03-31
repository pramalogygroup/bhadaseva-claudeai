import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOwnerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  bio?: string;
  address: string;
  ward?: string;
  district: string;
  contactPhone: string;
  contactEmail: string;
  panNumber?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerProfileSchema = new Schema<IOwnerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    displayName: { type: String, required: true },
    bio: { type: String },
    address: { type: String, required: true },
    ward: { type: String },
    district: {
      type: String,
      enum: ["Kathmandu", "Lalitpur", "Bhaktapur"],
      required: true,
    },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    panNumber: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default (mongoose.models.OwnerProfile as Model<IOwnerProfile>) ||
  mongoose.model<IOwnerProfile>("OwnerProfile", OwnerProfileSchema);
