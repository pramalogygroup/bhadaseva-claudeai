import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MarketplaceListing from "@/models/MarketplaceListing";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const district = searchParams.get("district");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const furnished = searchParams.get("furnished");
    const q = searchParams.get("q");

    const filter: Record<string, unknown> = { isActive: true };

    if (q) {
      filter.title = { $regex: q, $options: "i" };
    }
    if (type) {
      filter.type = type;
    }
    if (district) {
      filter.district = district;
    }
    if (minPrice || maxPrice) {
      filter.rentAmount = {} as Record<string, number>;
      if (minPrice) (filter.rentAmount as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.rentAmount as Record<string, number>).$lte = Number(maxPrice);
    }
    if (furnished === "true") {
      filter.isFurnished = true;
    }

    const listings = await MarketplaceListing.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(listings);
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
