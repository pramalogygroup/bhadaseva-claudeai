import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      activeProfileType: "owner" | "tenant" | null;
      enabledProfiles: Array<"owner" | "tenant">;
      ownerProfileId?: string;
      tenantProfileId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    activeProfileType: "owner" | "tenant" | null;
    enabledProfiles: Array<"owner" | "tenant">;
    ownerProfileId?: string;
    tenantProfileId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    activeProfileType: "owner" | "tenant" | null;
    enabledProfiles: Array<"owner" | "tenant">;
    ownerProfileId?: string;
    tenantProfileId?: string;
  }
}
