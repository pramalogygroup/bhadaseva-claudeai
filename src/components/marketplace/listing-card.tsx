import Link from "next/link";
import { Home } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/utils";

interface ListingCardProps {
  id: string;
  title: string;
  type: string;
  district: string;
  rentAmount: number;
  area?: number;
  isFurnished: boolean;
  photos: string[];
}

export default function ListingCard({
  id,
  title,
  type,
  district,
  rentAmount,
  area,
  isFurnished,
  photos,
}: ListingCardProps) {
  return (
    <Link href={`/listings/${id}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md p-0 gap-0">
        <div className="flex h-48 items-center justify-center rounded-t-xl bg-muted">
          {photos.length > 0 ? (
            <img
              src={photos[0]}
              alt={title}
              className="h-full w-full object-cover rounded-t-xl"
            />
          ) : (
            <Home className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        <CardContent className="pt-4">
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {type}
            </Badge>
            <span className="text-sm text-muted-foreground">{district}</span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center gap-3 text-sm pt-0">
          <span className="font-bold text-primary">
            {formatNPR(rentAmount)}/month
          </span>
          {area && (
            <span className="text-muted-foreground">{area} sq ft</span>
          )}
          {isFurnished && <Badge variant="outline">Furnished</Badge>}
        </CardFooter>
      </Card>
    </Link>
  );
}
