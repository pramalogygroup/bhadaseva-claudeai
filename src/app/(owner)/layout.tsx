import { requireOwnerProfile } from "@/lib/auth-helpers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OwnerSidebar } from "@/components/owner/owner-sidebar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwnerProfile();

  return (
    <SidebarProvider>
      <OwnerSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
