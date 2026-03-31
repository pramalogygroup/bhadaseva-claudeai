import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Lease from "@/models/Lease";
import Unit from "@/models/Unit";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    const lease = await Lease.findById(id);
    if (!lease || lease.ownerProfileId.toString() !== session.user.ownerProfileId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    lease.status = "terminated";
    await lease.save();

    await Unit.findByIdAndUpdate(lease.unitId, {
      status: "vacant",
      $unset: { currentLeaseId: "" },
    });

    return NextResponse.json(lease);
  } catch (error) {
    console.error("POST /api/leases/[id]/terminate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
