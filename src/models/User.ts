import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  ownerProfileId?: mongoose.Types.ObjectId;
  tenantProfileId?: mongoose.Types.ObjectId;
  activeProfileType: "owner" | "tenant" | null;
  enabledProfiles: Array<"owner" | "tenant">;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },
    ownerProfileId: { type: Schema.Types.ObjectId, ref: "OwnerProfile" },
    tenantProfileId: { type: Schema.Types.ObjectId, ref: "TenantProfile" },
    activeProfileType: {
      type: String,
      enum: ["owner", "tenant", null],
      default: null,
    },
    enabledProfiles: {
      type: [{ type: String, enum: ["owner", "tenant"] }],
      default: [],
    },
  },
  { timestamps: true }
);

export default (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
