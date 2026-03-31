import { requireTenantProfile } from "@/lib/auth-helpers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TenantSidebar } from "@/components/tenant/tenant-sidebar";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTenantProfile();

  return (
    <SidebarProvider>
      <TenantSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
