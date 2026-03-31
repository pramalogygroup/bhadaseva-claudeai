import { CreditCard, Home, Calendar, AlertCircle } from "lucide-react";
import { requireTenantProfile } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import Lease from "@/models/Lease";
import RentPayment from "@/models/RentPayment";
import { AppHeader } from "@/components/shared/app-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TenantDashboardPage() {
  const session = await requireTenantProfile();
  const tenantProfileId = session.user.tenantProfileId;

  await dbConnect();

  const activeLease = await Lease.findOne({
    tenantProfileId,
    status: "active",
  })
    .populate("propertyId", "name address")
    .populate("unitId", "unitNumber")
    .lean();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const currentPayment = activeLease
    ? await RentPayment.findOne({
        tenantProfileId,
        leaseId: activeLease._id,
        month: currentMonth,
      }).lean()
    : null;

  const recentPayments = await RentPayment.find({ tenantProfileId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const property = activeLease?.propertyId as unknown as {
    name?: string;
    address?: string;
  } | null;
  const unit = activeLease?.unitId as unknown as {
    unitNumber?: string;
  } | null;

  // Calculate next due date
  let nextDueDate = "-";
  if (activeLease) {
    const dueDay = activeLease.rentDueDay;
    const nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay);
    if (nextDue < now) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    nextDueDate = nextDue.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <>
      <AppHeader title="Dashboard" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        {activeLease ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Property"
                value={property?.name ?? "-"}
                description={property?.address}
                icon={Home}
              />
              <StatsCard
                title="Unit"
                value={unit?.unitNumber ?? "-"}
                description="Your rented unit"
                icon={Home}
              />
              <StatsCard
                title="Monthly Rent"
                value={`Rs. ${activeLease.monthlyRent.toLocaleString()}`}
                description="Per month"
                icon={CreditCard}
              />
              <StatsCard
                title="Next Due Date"
                value={nextDueDate}
                description={`Due on day ${activeLease.rentDueDay} of each month`}
                icon={Calendar}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Amount Due This Month</CardTitle>
              </CardHeader>
              <CardContent>
                {currentPayment ? (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold">
                      Rs. {currentPayment.amount.toLocaleString()}
                    </span>
                    <Badge
                      variant={
                        currentPayment.status === "paid"
                          ? "default"
                          : currentPayment.status === "overdue"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {currentPayment.status}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold">
                      Rs. {activeLease.monthlyRent.toLocaleString()}
                    </span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No payment history yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentPayments.map((payment) => (
                      <div
                        key={payment._id.toString()}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{payment.month}</p>
                          <p className="text-xs text-muted-foreground">
                            Rs. {payment.amount.toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            payment.status === "paid"
                              ? "default"
                              : payment.status === "overdue"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-16 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Active Lease</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                You do not have an active lease. Contact your landlord to set up
                your rental agreement.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
