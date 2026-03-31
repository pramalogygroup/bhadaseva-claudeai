import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface ITeamMemberPermissions {
  canAddTenants: boolean;
  canRecordPayments: boolean;
  canViewReports: boolean;
  canManageUnits: boolean;
}

export interface ITeamMember extends Document {
  ownerProfileId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  inviteEmail: string;
  role: "manager" | "viewer";
  permissions: ITeamMemberPermissions;
  status: "pending" | "active" | "revoked";
  inviteToken: string;
  inviteExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    ownerProfileId: {
      type: Schema.Types.ObjectId,
      ref: "OwnerProfile",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    inviteEmail: { type: String, required: true, lowercase: true },
    role: {
      type: String,
      enum: ["manager", "viewer"],
      default: "manager",
    },
    permissions: {
      canAddTenants: { type: Boolean, default: false },
      canRecordPayments: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageUnits: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["pending", "active", "revoked"],
      default: "pending",
    },
    inviteToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString("hex"),
    },
    inviteExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

TeamMemberSchema.index({ ownerProfileId: 1 });
TeamMemberSchema.index({ inviteToken: 1 });

export default (mongoose.models.TeamMember as Model<ITeamMember>) ||
  mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);
