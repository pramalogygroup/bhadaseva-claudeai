import Link from "next/link";
import {
  BedDouble,
  Building,
  Building2,
  Home,
  Castle,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/marketplace/listing-card";
import MarketplaceNavbar from "@/components/marketplace/marketplace-navbar";
import dbConnect from "@/lib/mongodb";
import MarketplaceListing from "@/models/MarketplaceListing";

const CATEGORIES = [
  { name: "Room", icon: BedDouble, type: "room" },
  { name: "Hostel", icon: Building, type: "hostel" },
  { name: "Apartment", icon: Building2, type: "apartment" },
  { name: "Flat", icon: Home, type: "flat" },
  { name: "House", icon: Castle, type: "house" },
];

export default async function HomePage() {
  await dbConnect();
  const listings = await MarketplaceListing.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return (
    <>
      <MarketplaceNavbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find Your Next Rental in{" "}
              <span className="text-[var(--primary)]">Kathmandu Valley</span>
            </h1>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Browse thousands of rooms, apartments, and hostels across
              Kathmandu, Lalitpur, and Bhaktapur.
            </p>
            <form action="/listings" className="mt-8 flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  name="q"
                  placeholder="Search rooms, apartments..."
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {CATEGORIES.map((cat) => (
                <Link key={cat.type} href={`/listings?type=${cat.type}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer text-center p-6">
                    <CardContent className="flex flex-col items-center gap-3 p-0">
                      <cat.icon className="h-10 w-10 text-[var(--primary)]" />
                      <span className="font-medium">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-16 px-4 bg-[var(--muted)]">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Featured Listings
            </h2>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <p className="text-center text-[var(--muted-foreground)]">
                No listings yet. Be the first to list your property!
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
