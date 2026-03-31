import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RentPayment from "@/models/RentPayment";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};

    if (session.user.activeProfileType === "owner") {
      filter.ownerProfileId = session.user.ownerProfileId;
    } else {
      filter.tenantProfileId = session.user.tenantProfileId;
    }

    if (month) filter.month = month;
    if (status) filter.status = status;

    const payments = await RentPayment.find(filter)
      .populate("leaseId")
      .populate("unitId", "unitNumber")
      .populate("tenantProfileId", "displayName")
      .sort({ dueDate: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const payment = await RentPayment.create({
      ...body,
      ownerProfileId: session.user.ownerProfileId,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
