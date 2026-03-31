import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMarketplaceListing extends Document {
  unitId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  ownerProfileId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  rentAmount: number;
  deposit: number;
  type: string;
  area?: number;
  isFurnished: boolean;
  photos: string[];
  amenities: string[];
  district: string;
  ward?: string;
  nearbyLandmarks: string[];
  isActive: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>(
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
    title: { type: String, required: true },
    description: { type: String },
    rentAmount: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["room", "hostel", "apartment", "flat", "house"],
      required: true,
    },
    area: { type: Number },
    isFurnished: { type: Boolean, default: false },
    photos: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    district: {
      type: String,
      enum: ["Kathmandu", "Lalitpur", "Bhaktapur"],
      required: true,
    },
    ward: { type: String },
    nearbyLandmarks: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MarketplaceListingSchema.index({ district: 1, type: 1, isActive: 1 });
MarketplaceListingSchema.index({ rentAmount: 1 });
MarketplaceListingSchema.index({ ownerProfileId: 1 });

export default (mongoose.models.MarketplaceListing as Model<IMarketplaceListing>) ||
  mongoose.model<IMarketplaceListing>(
    "MarketplaceListing",
    MarketplaceListingSchema
  );
