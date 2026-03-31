import { Users } from "lucide-react";
import { requireOwnerProfile } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import Lease from "@/models/Lease";
import { AppHeader } from "@/components/shared/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  terminated: "destructive",
  expired: "secondary",
};

export default async function TenantsPage() {
  const session = await requireOwnerProfile();
  const ownerProfileId = session.user.ownerProfileId;

  await dbConnect();

  const leases = await Lease.find({ ownerProfileId })
    .populate("tenantProfileId", "name phone")
    .populate("propertyId", "name")
    .populate("unitId", "unitNumber")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <>
      <AppHeader title="Tenants" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            Manage your tenant leases
          </p>
        </div>

        {leases.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No tenants yet"
            description="Your tenants will appear here once you create leases."
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => {
                  const tenant = lease.tenantProfileId as unknown as { name?: string };
                  const property = lease.propertyId as unknown as { name?: string };
                  const unit = lease.unitId as unknown as { unitNumber?: string };

                  return (
                    <TableRow key={lease._id.toString()}>
                      <TableCell className="font-medium">
                        {tenant?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell>{property?.name ?? "-"}</TableCell>
                      <TableCell>{unit?.unitNumber ?? "-"}</TableCell>
                      <TableCell>
                        Rs. {lease.monthlyRent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(lease.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusVariant[lease.status] ?? "outline"}
                          className="capitalize"
                        >
                          {lease.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
