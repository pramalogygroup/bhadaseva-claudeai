import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

export async function requireOwnerProfile() {
  const session = await requireAuth();
  if (!session.user.ownerProfileId) {
    redirect("/onboarding?profile=owner");
  }
  return session;
}

export async function requireTenantProfile() {
  const session = await requireAuth();
  if (!session.user.tenantProfileId) {
    redirect("/onboarding?profile=tenant");
  }
  return session;
}
