import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Lease from "@/models/Lease";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const filter: Record<string, unknown> = {};
    if (session.user.activeProfileType === "owner") {
      filter.ownerProfileId = session.user.ownerProfileId;
    } else {
      filter.tenantProfileId = session.user.tenantProfileId;
    }

    const leases = await Lease.find(filter)
      .populate("unitId", "unitNumber floor rentAmount")
      .populate("propertyId", "name address")
      .populate("tenantProfileId", "displayName")
      .populate("ownerProfileId", "displayName");

    return NextResponse.json(leases);
  } catch (error) {
    console.error("GET /api/leases error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
