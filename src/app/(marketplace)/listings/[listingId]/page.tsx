import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import MarketplaceListing from "@/models/MarketplaceListing";
import OwnerProfile from "@/models/OwnerProfile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatNPR } from "@/lib/utils";

interface ListingDetailPageProps {
  params: Promise<{ listingId: string }>;
}

export default async function ListingDetailPage(
  props: ListingDetailPageProps
) {
  const { listingId } = await props.params;

  await dbConnect();

  const listing = await MarketplaceListing.findById(listingId).lean();

  if (!listing) {
    return notFound();
  }

  // Increment view count (fire-and-forget)
  MarketplaceListing.findByIdAndUpdate(listingId, {
    $inc: { viewCount: 1 },
  }).exec();

  const owner = await OwnerProfile.findById(listing.ownerProfileId).lean();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/listings"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo area */}
          {listing.photos.length > 0 ? (
            <div className="overflow-hidden rounded-xl">
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="h-80 w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              No photos available
            </div>
          )}

          {/* Title & meta */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <Badge variant="secondary" className="capitalize">
                {listing.type}
              </Badge>
              {listing.isFurnished && (
                <Badge variant="outline">Furnished</Badge>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              {listing.district}
              {listing.ward ? `, Ward ${listing.ward}` : ""}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-primary">
              {formatNPR(listing.rentAmount)}
              <span className="text-base font-normal text-muted-foreground">
                /month
              </span>
            </span>
            {listing.deposit > 0 && (
              <span className="text-sm text-muted-foreground">
                Deposit: {formatNPR(listing.deposit)}
              </span>
            )}
          </div>

          <Separator />

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">
                {listing.description}
              </p>
            </div>
          )}

          {/* Area */}
          {listing.area && (
            <div>
              <h2 className="text-lg font-semibold">Area</h2>
              <p className="mt-1 text-muted-foreground">
                {listing.area} sq ft
              </p>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Landmarks */}
          {listing.nearbyLandmarks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold">Nearby Landmarks</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                {listing.nearbyLandmarks.map((landmark) => (
                  <li key={landmark}>{landmark}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar - Owner Info */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Contact Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {owner ? (
                <>
                  <div>
                    <p className="font-semibold">{owner.displayName}</p>
                    {owner.bio && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {owner.bio}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{owner.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{owner.contactEmail}</span>
                    </div>
                  </div>

                  <Button className="w-full" asChild>
                    <a href={`mailto:${owner.contactEmail}`}>Contact Owner</a>
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Owner information is not available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
