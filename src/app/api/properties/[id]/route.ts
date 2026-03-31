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

    return NextResponse.json(property);
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
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
    const updated = await Property.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    const property = await Property.findById(id);
    if (!property || property.ownerProfileId.toString() !== session.user.ownerProfileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Unit.deleteMany({ propertyId: id });
    await Property.findByIdAndDelete(id);

    return NextResponse.json({ message: "Property deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
