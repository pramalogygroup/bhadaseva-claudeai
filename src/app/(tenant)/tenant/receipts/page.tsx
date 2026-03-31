import { FileText } from "lucide-react";
import { requireTenantProfile } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
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
  sent: "secondary",
  draft: "outline",
  overdue: "destructive",
};

export default async function TenantReceiptsPage() {
  const session = await requireTenantProfile();
  const tenantProfileId = session.user.tenantProfileId;

  await dbConnect();

  const invoices = await Invoice.find({ tenantProfileId })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <>
      <AppHeader title="Receipts" />
      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Receipts</h2>
          <p className="text-muted-foreground">
            View your invoices and receipts
          </p>
        </div>

        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No receipts yet"
            description="Your invoices and receipts will appear here."
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id.toString()}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      Rs. {invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[invoice.status] ?? "outline"}
                        className="capitalize"
                      >
                        {invoice.status}
                      </Badge>
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
