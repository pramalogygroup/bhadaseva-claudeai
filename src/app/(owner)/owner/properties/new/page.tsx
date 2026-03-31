"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { propertySchema, type PropertyInput } from "@/lib/validations/property.schema";
import { AppHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amenitiesInput, setAmenitiesInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      amenities: [],
    },
  });

  async function onSubmit(data: PropertyInput) {
    setLoading(true);
    try {
      const amenities = amenitiesInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amenities }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create property");
      }

      router.push("/owner/properties");
      router.refresh();
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader title="Add Property" />
      <div className="flex-1 p-4 lg:p-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/properties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Sunrise Apartments"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. Thamel, Kathmandu"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    placeholder="e.g. Ward 26"
                    {...register("ward")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("district", value as PropertyInput["district"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kathmandu">Kathmandu</SelectItem>
                      <SelectItem value="Lalitpur">Lalitpur</SelectItem>
                      <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.district && (
                    <p className="text-sm text-destructive">
                      {errors.district.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("type", value as PropertyInput["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the property"
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Input
                  id="amenities"
                  placeholder="e.g. Parking, WiFi, Water Tank (comma-separated)"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter amenities separated by commas
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Property
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/owner/properties">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
