import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Unit from "@/models/Unit";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    const property = await Property.findById(id);
    if (!property || property.ownerProfileId.toString() !== session.user.ownerProfileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const units = await Unit.find({ propertyId: id });
    return NextResponse.json(units);
  } catch (error) {
    console.error("GET /api/properties/[id]/units error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    const property = await Property.findById(id);
    if (!property || property.ownerProfileId.toString() !== session.user.ownerProfileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const unit = await Unit.create({
      ...body,
      propertyId: id,
    });

    await Property.findByIdAndUpdate(id, { $inc: { totalUnits: 1 } });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties/[id]/units error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
