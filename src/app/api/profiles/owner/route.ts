import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import OwnerProfile from "@/models/OwnerProfile";
import User from "@/models/User";
import { ownerProfileSchema } from "@/lib/validations/auth.schema";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ownerProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingProfile = await OwnerProfile.findOne({
      userId: session.user.id,
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Owner profile already exists" },
        { status: 409 }
      );
    }

    const profile = await OwnerProfile.create({
      ...parsed.data,
      userId: session.user.id,
    });

    await User.findByIdAndUpdate(session.user.id, {
      ownerProfileId: profile._id,
      activeProfileType: "owner",
      $addToSet: { enabledProfiles: "owner" },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating owner profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
