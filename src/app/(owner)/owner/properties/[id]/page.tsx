import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Pencil, Plus } from "lucide-react";
import { requireOwnerProfile } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import { AppHeader } from "@/components/shared/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UnitListingToggle } from "@/components/owner/unit-listing-toggle";

const statusColors: Record<string, string> = {
  vacant: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  occupied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireOwnerProfile();
  const ownerProfileId = session.user.ownerProfileId;

  await dbConnect();

  const property = await Property.findOne({
    _id: id,
    ownerProfileId,
  }).lean();

  if (!property) {
    notFound();
  }

  const units = await Unit.find({ propertyId: property._id })
    .sort({ unitNumber: 1 })
    .lean();

  return (
    <>
      <AppHeader title={property.name} />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {property.name}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {property.address}
                {property.ward && `, ${property.ward}`}, {property.district}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/owner/properties/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {property.type}
          </Badge>
          {property.amenities.map((amenity) => (
            <Badge key={amenity} variant="outline">
              {amenity}
            </Badge>
          ))}
        </div>

        {property.description && (
          <p className="text-sm text-muted-foreground">{property.description}</p>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Units ({units.length})
          </h3>
          <Button size="sm" asChild>
            <Link href={`/owner/properties/${id}/units/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Link>
          </Button>
        </div>

        {units.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No units yet"
            description="Add units to this property to start managing them."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <Card key={unit._id.toString()}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Unit {unit.unitNumber}
                    </CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        statusColors[unit.status] ?? ""
                      }`}
                    >
                      {unit.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {unit.floor !== undefined && (
                    <p className="text-muted-foreground">Floor: {unit.floor}</p>
                  )}
                  <p className="font-medium">
                    Rs. {unit.rentAmount.toLocaleString()}/month
                  </p>
                  {unit.deposit > 0 && (
                    <p className="text-muted-foreground">
                      Deposit: Rs. {unit.deposit.toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {unit.isFurnished && (
                      <Badge variant="outline" className="text-xs">
                        Furnished
                      </Badge>
                    )}
                    {unit.area && (
                      <Badge variant="outline" className="text-xs">
                        {unit.area} sq ft
                      </Badge>
                    )}
                  </div>
                  <div className="pt-2">
                    <UnitListingToggle
                      propertyId={String(property._id)}
                      unitId={String(unit._id)}
                      isPublicListing={unit.isPublicListing ?? false}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
