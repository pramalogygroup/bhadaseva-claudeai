"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, ChevronDown, Home, LogOut, Plus, Store } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ProfileSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  if (!session?.user) return null;

  const { activeProfileType, enabledProfiles, name } = session.user;

  const initials = name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  const profileLabel = activeProfileType === "owner" ? "Owner" : "Tenant";
  const ProfileIcon = activeProfileType === "owner" ? Building2 : Home;

  async function handleSwitch(profileType: "owner" | "tenant") {
    if (profileType === activeProfileType || switching) return;

    setSwitching(true);
    try {
      const res = await fetch("/api/users/switch-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileType }),
      });

      if (!res.ok) throw new Error("Failed to switch profile");

      await update({ activeProfileType: profileType });

      router.push(profileType === "owner" ? "/owner/dashboard" : "/tenant/dashboard");
      router.refresh();
    } catch {
      // Silently handle error
    } finally {
      setSwitching(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <ProfileIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{profileLabel}</span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Switch Profile
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {enabledProfiles?.includes("owner") && (
          <DropdownMenuItem
            onClick={() => handleSwitch("owner")}
            disabled={switching}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            <span>Owner Profile</span>
            {activeProfileType === "owner" && (
              <span className="ml-auto text-xs text-muted-foreground">Active</span>
            )}
          </DropdownMenuItem>
        )}

        {enabledProfiles?.includes("tenant") && (
          <DropdownMenuItem
            onClick={() => handleSwitch("tenant")}
            disabled={switching}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span>Tenant Profile</span>
            {activeProfileType === "tenant" && (
              <span className="ml-auto text-xs text-muted-foreground">Active</span>
            )}
          </DropdownMenuItem>
        )}

        {!enabledProfiles?.includes("owner") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/onboarding?profile=owner")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Activate Owner Profile</span>
            </DropdownMenuItem>
          </>
        )}

        {!enabledProfiles?.includes("tenant") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/onboarding?profile=tenant")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Activate Tenant Profile</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <Store className="h-4 w-4" />
          <span>Marketplace</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
