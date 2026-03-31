import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MarketplaceListing from "@/models/MarketplaceListing";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();

    const { id } = await props.params;
    const listing = await MarketplaceListing.findById(id).populate(
      "ownerProfileId",
      "displayName contactPhone contactEmail"
    );

    if (!listing || !listing.isActive) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await MarketplaceListing.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
