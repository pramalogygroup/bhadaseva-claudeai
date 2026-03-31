"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import {
  tenantProfileSchema,
  type TenantProfileInput,
} from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TenantOnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const form = useForm<TenantProfileInput>({
    resolver: zodResolver(tenantProfileSchema),
    defaultValues: {
      displayName: session?.user?.name || "",
      occupation: "",
      employerName: "",
      permanentAddress: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
  });

  async function onSubmit(values: TenantProfileInput) {
    const res = await fetch("/api/profiles/tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to create tenant profile");
      return;
    }

    const profile = await res.json();

    await update({
      activeProfileType: session?.user?.activeProfileType || "tenant",
      enabledProfiles: [...(session?.user?.enabledProfiles || []), "tenant"],
      tenantProfileId: profile._id,
    });

    toast.success("Tenant profile created!");
    router.push("/tenant/dashboard");
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle>Tenant Profile</CardTitle>
        <CardDescription>Set up your tenant profile</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your occupation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your employer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your permanent address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Phone (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="98XXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Creating profile..."
                : "Create Tenant Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
