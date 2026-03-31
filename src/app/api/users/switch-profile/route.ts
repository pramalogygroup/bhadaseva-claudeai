import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { profileType } = await req.json();

    if (!profileType || !["owner", "tenant"].includes(profileType)) {
      return NextResponse.json(
        { message: "Invalid profile type. Must be 'owner' or 'tenant'." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.enabledProfiles.includes(profileType)) {
      return NextResponse.json(
        { message: `${profileType} profile is not enabled` },
        { status: 400 }
      );
    }

    user.activeProfileType = profileType;
    await user.save();

    return NextResponse.json({
      message: "Profile switched successfully",
      activeProfileType: profileType,
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
