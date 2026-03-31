"use client";

import { useState } from "react";
import { Globe, GlobeLock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UnitListingToggleProps {
  propertyId: string;
  unitId: string;
  isPublicListing: boolean;
}

export function UnitListingToggle({
  propertyId,
  unitId,
  isPublicListing: initial,
}: UnitListingToggleProps) {
  const [isPublic, setIsPublic] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/units/${unitId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublicListing: !isPublic }),
        }
      );
      if (res.ok) {
        setIsPublic(!isPublic);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isPublic ? "default" : "outline"}
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className="gap-1.5"
          >
            {isPublic ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <GlobeLock className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">
              {isPublic ? "Listed" : "Unlisted"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPublic
            ? "This unit is visible on the marketplace. Click to hide."
            : "This unit is hidden from the marketplace. Click to list."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
