import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RentPayment from "@/models/RentPayment";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    const payment = await RentPayment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await props.params;
    const payment = await RentPayment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const updated = await RentPayment.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/payments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
