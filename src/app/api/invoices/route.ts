import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { generateInvoiceNumber } from "@/lib/utils";

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

    const invoices = await Invoice.find(filter);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const invoiceNumber = generateInvoiceNumber();

    const invoice = await Invoice.create({
      ...body,
      invoiceNumber,
      ownerProfileId: session.user.ownerProfileId,
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
