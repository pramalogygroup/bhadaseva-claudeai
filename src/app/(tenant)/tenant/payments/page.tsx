import { CreditCard } from "lucide-react";
import { requireTenantProfile } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import RentPayment from "@/models/RentPayment";
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
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
};

export default async function TenantPaymentsPage() {
  const session = await requireTenantProfile();
  const tenantProfileId = session.user.tenantProfileId;

  await dbConnect();

  const payments = await RentPayment.find({ tenantProfileId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <>
      <AppHeader title="Payments" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground">
            View your rent payment history
          </p>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Your payment history will appear here."
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id.toString()}>
                    <TableCell className="font-medium">
                      {payment.month}
                    </TableCell>
                    <TableCell>
                      Rs. {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[payment.status] ?? "outline"}
                        className="capitalize"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.paidDate
                        ? new Date(payment.paidDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
