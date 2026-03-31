import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import Unit from "@/models/Unit";
import Lease from "@/models/Lease";
import User from "@/models/User";

export async function POST(
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

    if (unit.status !== "vacant") {
      return NextResponse.json({ error: "Unit is not vacant" }, { status: 400 });
    }

    const body = await req.json();
    const { tenantEmail, monthlyRent, depositAmount, startDate, rentDueDay } = body;

    const tenantUser = await User.findOne({ email: tenantEmail });
    if (!tenantUser || !tenantUser.tenantProfileId) {
      return NextResponse.json(
        { error: "Tenant not found or user does not have a tenant profile" },
        { status: 400 }
      );
    }

    const lease = await Lease.create({
      unitId,
      propertyId: id,
      ownerProfileId: session.user.ownerProfileId,
      tenantProfileId: tenantUser.tenantProfileId,
      startDate,
      monthlyRent,
      depositAmount,
      rentDueDay,
      status: "active",
    });

    await Unit.findByIdAndUpdate(unitId, {
      status: "occupied",
      currentLeaseId: lease._id,
    });

    return NextResponse.json(lease, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties/[id]/units/[unitId]/assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
