"use client";

import { useRouter } from "next/navigation";
import { Building, Home, ArrowLeftRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const profiles = [
  {
    type: "owner" as const,
    title: "Property Owner",
    description: "Manage your rental properties",
    icon: Building,
    href: "/onboarding/owner",
  },
  {
    type: "tenant" as const,
    title: "Tenant",
    description: "Find and manage your rental",
    icon: Home,
    href: "/onboarding/tenant",
  },
  {
    type: "both" as const,
    title: "Both",
    description: "I own properties and also rent",
    icon: ArrowLeftRight,
    href: "/onboarding/owner?next=tenant",
  },
];

export function ProfileSelector() {
  const router = useRouter();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {profiles.map((profile) => (
        <Card
          key={profile.type}
          className="cursor-pointer transition-colors hover:border-primary"
          onClick={() => router.push(profile.href)}
        >
          <CardHeader className="items-center text-center">
            <profile.icon className="h-10 w-10 text-muted-foreground" />
            <CardTitle>{profile.title}</CardTitle>
            <CardDescription>{profile.description}</CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      ))}
    </div>
  );
}
