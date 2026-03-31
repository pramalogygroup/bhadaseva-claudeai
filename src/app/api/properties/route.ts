import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const properties = await Property.find({
      ownerProfileId: session.user.ownerProfileId,
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const property = await Property.create({
      ...body,
      ownerProfileId: session.user.ownerProfileId,
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
