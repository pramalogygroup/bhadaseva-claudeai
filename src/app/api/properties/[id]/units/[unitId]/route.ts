import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import MarketplaceListing from "@/models/MarketplaceListing";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, unitId } = await props.params;
    const property = await Property.findById(id);
    if (!property || property.ownerProfileId.toString() !== session.user.ownerProfileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const unit = await Unit.findById(unitId);
    if (!unit || unit.propertyId.toString() !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("GET /api/properties/[id]/units/[unitId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, unitId } = await props.params;
    const property = await Property.findById(id);
    if (!property || property.ownerProfileId.toString() !== session.user.ownerProfileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const unit = await Unit.findById(unitId);
    if (!unit || unit.propertyId.toString() !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const updated = await Unit.findByIdAndUpdate(unitId, body, { new: true });

    // Sync MarketplaceListing when isPublicListing changes
    if (body.isPublicListing !== undefined) {
      const existingListing = await MarketplaceListing.findOne({ unitId });

      if (body.isPublicListing) {
        // Create or reactivate listing
        if (existingListing) {
          await MarketplaceListing.findByIdAndUpdate(existingListing._id, {
            isActive: true,
            rentAmount: updated!.rentAmount,
            deposit: updated!.deposit,
            area: updated!.area,
            isFurnished: updated!.isFurnished,
          });
        } else {
          await MarketplaceListing.create({
            unitId: updated!._id,
            propertyId: property._id,
            ownerProfileId: property.ownerProfileId,
            title: `${property.name} - Unit ${updated!.unitNumber}`,
            description: property.description,
            rentAmount: updated!.rentAmount,
            deposit: updated!.deposit,
            type: property.type,
            area: updated!.area,
            isFurnished: updated!.isFurnished,
            photos: updated!.photos.length > 0 ? updated!.photos : property.photos,
            amenities: property.amenities,
            district: property.district,
            ward: property.ward,
            isActive: true,
          });
        }
      } else {
        // Deactivate listing
        if (existingListing) {
          await MarketplaceListing.findByIdAndUpdate(existingListing._id, {
            isActive: false,
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/properties/[id]/units/[unitId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, unitId } = await props.params;
    const property = await Property.findById(id);
    if (!property || property.ownerProfileId.toString() !== session.user.ownerProfileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const unit = await Unit.findById(unitId);
    if (!unit || unit.propertyId.toString() !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Unit.findByIdAndDelete(unitId);
    await Property.findByIdAndUpdate(id, { $inc: { totalUnits: -1 } });

    return NextResponse.json({ message: "Unit deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/properties/[id]/units/[unitId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
