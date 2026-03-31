import Link from "next/link";
import { Building2, MapPin, Plus } from "lucide-react";
import { requireOwnerProfile } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import { AppHeader } from "@/components/shared/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PropertiesPage() {
  const session = await requireOwnerProfile();
  const ownerProfileId = session.user.ownerProfileId;

  await dbConnect();

  const properties = await Property.find({ ownerProfileId })
    .sort({ createdAt: -1 })
    .lean();

  // Get unit counts per property
  const propertyIds = properties.map((p) => p._id);
  const unitCounts = await Unit.aggregate([
    { $match: { propertyId: { $in: propertyIds } } },
    {
      $group: {
        _id: "$propertyId",
        total: { $sum: 1 },
        occupied: {
          $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] },
        },
      },
    },
  ]);

  const unitCountMap = new Map(
    unitCounts.map((u) => [u._id.toString(), { total: u.total, occupied: u.occupied }])
  );

  return (
    <>
      <AppHeader title="Properties" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Properties</h2>
            <p className="text-muted-foreground">
              Manage your rental properties
            </p>
          </div>
          <Button asChild>
            <Link href="/owner/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Get started by adding your first rental property."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const counts = unitCountMap.get(property._id.toString()) ?? {
                total: 0,
                occupied: 0,
              };
              return (
                <Link
                  key={property._id.toString()}
                  href={`/owner/properties/${property._id.toString()}`}
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {property.name}
                        </CardTitle>
                        <Badge variant="secondary" className="capitalize">
                          {property.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {property.address}, {property.district}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <strong>{counts.total}</strong> units
                        </span>
                        <span>
                          <strong>{counts.occupied}</strong> occupied
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
