import mongoose, { Schema, Document, Model } from "mongoose";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface IInvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  ownerProfileId: mongoose.Types.ObjectId;
  tenantProfileId: mongoose.Types.ObjectId;
  leaseId: mongoose.Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
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
    leaseId: { type: Schema.Types.ObjectId, ref: "Lease", required: true },
    items: { type: [InvoiceItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue"],
      default: "draft",
    },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ ownerProfileId: 1, status: 1 });
InvoiceSchema.index({ tenantProfileId: 1 });

export default (mongoose.models.Invoice as Model<IInvoice>) ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);
