"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { unitSchema, type UnitInput } from "@/lib/validations/property.schema";
import { AppHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewUnitPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      deposit: 0,
      isFurnished: false,
      isPublicListing: false,
    },
  });

  async function onSubmit(data: UnitInput) {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create unit");
      }

      router.push(`/owner/properties/${propertyId}`);
      router.refresh();
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader title="Add Unit" />
      <div className="flex-1 p-4 lg:p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/owner/properties/${propertyId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Property
            </Link>
          </Button>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>New Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number</Label>
                  <Input
                    id="unitNumber"
                    placeholder="e.g. 101"
                    {...register("unitNumber")}
                  />
                  {errors.unitNumber && (
                    <p className="text-sm text-destructive">
                      {errors.unitNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    placeholder="e.g. 1"
                    {...register("floor", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rentAmount">Monthly Rent (Rs.)</Label>
                  <Input
                    id="rentAmount"
                    type="number"
                    placeholder="e.g. 15000"
                    {...register("rentAmount", { valueAsNumber: true })}
                  />
                  {errors.rentAmount && (
                    <p className="text-sm text-destructive">
                      {errors.rentAmount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit">Security Deposit (Rs.)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="e.g. 15000"
                    {...register("deposit", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft)</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="e.g. 500"
                  {...register("area", { valueAsNumber: true })}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    {...register("isFurnished")}
                  />
                  Furnished
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    {...register("isPublicListing")}
                  />
                  Public Listing
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Unit
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/owner/properties/${propertyId}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
