import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const members = await TeamMember.find({
      ownerProfileId: session.user.ownerProfileId,
    }).populate("userId", "name email");

    return NextResponse.json(members);
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { email, role, permissions } = body;

    const member = await TeamMember.create({
      ownerProfileId: session.user.ownerProfileId,
      inviteEmail: email,
      role,
      permissions,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("POST /api/team error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
