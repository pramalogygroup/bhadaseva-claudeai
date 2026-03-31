import mongoose, { Schema, Document, Model } from "mongoose";

export type PropertyType = "room" | "hostel" | "apartment" | "flat" | "house";

export interface IProperty extends Document {
  ownerProfileId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  ward?: string;
  district: string;
  type: PropertyType;
  description?: string;
  photos: string[];
  amenities: string[];
  totalUnits: number;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    ownerProfileId: {
      type: Schema.Types.ObjectId,
      ref: "OwnerProfile",
      required: true,
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    ward: { type: String },
    district: {
      type: String,
      enum: ["Kathmandu", "Lalitpur", "Bhaktapur"],
      required: true,
    },
    type: {
      type: String,
      enum: ["room", "hostel", "apartment", "flat", "house"],
      required: true,
    },
    description: { type: String },
    photos: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    totalUnits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PropertySchema.index({ ownerProfileId: 1 });
PropertySchema.index({ district: 1, type: 1 });

export default (mongoose.models.Property as Model<IProperty>) ||
  mongoose.model<IProperty>("Property", PropertySchema);
