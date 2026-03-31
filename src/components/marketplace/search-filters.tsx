"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TYPES = ["all", "room", "hostel", "apartment", "flat", "house"];
const DISTRICTS = ["all", "Kathmandu", "Lalitpur", "Bhaktapur"];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") ?? "all";
  const currentDistrict = searchParams.get("district") ?? "all";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";
  const currentFurnished = searchParams.get("furnished") === "true";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/listings?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="type-filter">Type</Label>
          <select
            id="type-filter"
            value={currentType}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district-filter">District</Label>
          <select
            id="district-filter"
            value={currentDistrict}
            onChange={(e) => updateFilter("district", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d === "all" ? "All" : d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min-price">Min Price</Label>
          <Input
            id="min-price"
            type="number"
            placeholder="0"
            value={currentMinPrice}
            onChange={(e) => updateFilter("minPrice", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-price">Max Price</Label>
          <Input
            id="max-price"
            type="number"
            placeholder="Any"
            value={currentMaxPrice}
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="furnished-filter"
            type="checkbox"
            checked={currentFurnished}
            onChange={(e) =>
              updateFilter("furnished", e.target.checked ? "true" : "")
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="furnished-filter">Furnished Only</Label>
        </div>

        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}
