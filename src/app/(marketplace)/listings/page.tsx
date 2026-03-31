import { Suspense } from "react";
import dbConnect from "@/lib/mongodb";
import MarketplaceListing from "@/models/MarketplaceListing";
import ListingCard from "@/components/marketplace/listing-card";
import SearchFilters from "@/components/marketplace/search-filters";

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    furnished?: string;
  }>;
}

export default async function ListingsPage(props: ListingsPageProps) {
  const params = await props.searchParams;
  const { q, type, district, minPrice, maxPrice, furnished } = params;

  await dbConnect();

  // Build query
  const query: Record<string, unknown> = { isActive: true };

  if (q) {
    query.title = { $regex: q, $options: "i" };
  }
  if (type && type !== "all") {
    query.type = type;
  }
  if (district && district !== "all") {
    query.district = district;
  }
  if (minPrice || maxPrice) {
    query.rentAmount = {} as Record<string, number>;
    if (minPrice) {
      (query.rentAmount as Record<string, number>).$gte = Number(minPrice);
    }
    if (maxPrice) {
      (query.rentAmount as Record<string, number>).$lte = Number(maxPrice);
    }
  }
  if (furnished === "true") {
    query.isFurnished = true;
  }

  const listings = await MarketplaceListing.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <Suspense>
            <SearchFilters />
          </Suspense>
        </aside>

        {/* Listings Grid */}
        <div className="flex-1">
          <p className="mb-6 text-sm text-muted-foreground">
            {listings.length} listing{listings.length !== 1 ? "s" : ""} found
          </p>

          {listings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={String(listing._id)}
                  id={String(listing._id)}
                  title={listing.title}
                  type={listing.type}
                  district={listing.district}
                  rentAmount={listing.rentAmount}
                  area={listing.area}
                  isFurnished={listing.isFurnished}
                  photos={listing.photos}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium">No listings found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search term
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
