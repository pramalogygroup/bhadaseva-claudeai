import mongoose, { Schema, Document, Model } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "overdue";
export type PaymentMethod =
  | "cash"
  | "khalti"
  | "esewa"
  | "bank_transfer"
  | "other";

export interface IRentPayment extends Document {
  leaseId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  tenantProfileId: mongoose.Types.ObjectId;
  ownerProfileId: mongoose.Types.ObjectId;
  amount: number;
  month: string;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RentPaymentSchema = new Schema<IRentPayment>(
  {
    leaseId: { type: Schema.Types.ObjectId, ref: "Lease", required: true },
    unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    tenantProfileId: {
      type: Schema.Types.ObjectId,
      ref: "TenantProfile",
      required: true,
    },
    ownerProfileId: {
      type: Schema.Types.ObjectId,
      ref: "OwnerProfile",
      required: true,
    },
    amount: { type: Number, required: true },
    month: { type: String, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "khalti", "esewa", "bank_transfer", "other"],
    },
    notes: { type: String },
  },
  { timestamps: true }
);

RentPaymentSchema.index({ ownerProfileId: 1, month: 1 });
RentPaymentSchema.index({ tenantProfileId: 1, status: 1 });
RentPaymentSchema.index({ leaseId: 1 });

export default (mongoose.models.RentPayment as Model<IRentPayment>) ||
  mongoose.model<IRentPayment>("RentPayment", RentPaymentSchema);
