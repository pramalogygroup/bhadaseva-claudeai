import Link from "next/link";
import {
  Building2,
  CreditCard,
  DoorOpen,
  Home,
  Plus,
} from "lucide-react";
import { requireOwnerProfile } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import RentPayment from "@/models/RentPayment";
import { AppHeader } from "@/components/shared/app-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OwnerDashboardPage() {
  const session = await requireOwnerProfile();
  const ownerProfileId = session.user.ownerProfileId;

  await dbConnect();

  const [totalProperties, totalUnits, occupiedUnits, paymentsThisMonth] =
    await Promise.all([
      Property.countDocuments({ ownerProfileId }),
      Unit.countDocuments({
        propertyId: {
          $in: (
            await Property.find({ ownerProfileId }).select("_id").lean()
          ).map((p) => p._id),
        },
      }),
      Unit.countDocuments({
        propertyId: {
          $in: (
            await Property.find({ ownerProfileId }).select("_id").lean()
          ).map((p) => p._id),
        },
        status: "occupied",
      }),
      RentPayment.aggregate([
        {
          $match: {
            ownerProfileId: ownerProfileId,
            status: "paid",
            paidDate: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  const collectedThisMonth = paymentsThisMonth[0]?.total ?? 0;

  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Properties"
            value={totalProperties}
            description="Properties under management"
            icon={Building2}
          />
          <StatsCard
            title="Total Units"
            value={totalUnits}
            description="Across all properties"
            icon={Home}
          />
          <StatsCard
            title="Occupied Units"
            value={occupiedUnits}
            description={
              totalUnits > 0
                ? `${Math.round((occupiedUnits / totalUnits) * 100)}% occupancy rate`
                : "No units yet"
            }
            icon={DoorOpen}
          />
          <StatsCard
            title="Collected This Month"
            value={`Rs. ${collectedThisMonth.toLocaleString()}`}
            description="Total rent collected"
            icon={CreditCard}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No recent activity to show. Start by adding a property.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/owner/properties/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/owner/payments">
                  <CreditCard className="mr-2 h-4 w-4" />
                  View Payments
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
