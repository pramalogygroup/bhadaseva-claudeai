import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ownerProfileSchema = z.object({
  displayName: z.string().min(2, "Display name is required"),
  address: z.string().min(2, "Address is required"),
  ward: z.string().optional(),
  district: z.enum(["Kathmandu", "Lalitpur", "Bhaktapur"]),
  contactPhone: z.string().min(7, "Phone number is required"),
  contactEmail: z.string().email("Invalid email"),
  panNumber: z.string().optional(),
  bio: z.string().optional(),
});

export const tenantProfileSchema = z.object({
  displayName: z.string().min(2, "Display name is required"),
  occupation: z.string().optional(),
  employerName: z.string().optional(),
  permanentAddress: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  citizenshipNumber: z.string().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type OwnerProfileInput = z.infer<typeof ownerProfileSchema>;
export type TenantProfileInput = z.infer<typeof tenantProfileSchema>;
