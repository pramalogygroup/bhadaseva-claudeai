"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ProfileSelector } from "@/components/auth/profile-selector";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to BhadaSeva</h1>
        <p className="mt-2 text-muted-foreground">
          How would you like to use BhadaSeva?
        </p>
      </div>

      <ProfileSelector />
    </div>
  );
}
