import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(2, "Property name is required"),
  address: z.string().min(2, "Address is required"),
  ward: z.string().optional(),
  district: z.enum(["Kathmandu", "Lalitpur", "Bhaktapur"]),
  type: z.enum(["room", "hostel", "apartment", "flat", "house"]),
  description: z.string().optional(),
  amenities: z.array(z.string()),
});

export const unitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.number().optional(),
  rentAmount: z.number().min(1, "Rent amount is required"),
  deposit: z.number(),
  isFurnished: z.boolean(),
  area: z.number().optional(),
  isPublicListing: z.boolean(),
});

export const leaseSchema = z.object({
  tenantProfileId: z.string().min(1, "Tenant is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  monthlyRent: z.number().min(1, "Monthly rent is required"),
  depositAmount: z.number(),
  rentDueDay: z.number().min(1).max(28),
  notes: z.string().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;
export type UnitInput = z.infer<typeof unitSchema>;
export type LeaseInput = z.infer<typeof leaseSchema>;
