import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import TenantProfile from "@/models/TenantProfile";
import User from "@/models/User";
import { tenantProfileSchema } from "@/lib/validations/auth.schema";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = tenantProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingProfile = await TenantProfile.findOne({
      userId: session.user.id,
    });
    if (existingProfile) {
      return NextResponse.json(
        { error: "Tenant profile already exists" },
        { status: 409 }
      );
    }

    const profile = await TenantProfile.create({
      ...parsed.data,
      userId: session.user.id,
    });

    const user = await User.findById(session.user.id);
    const updateData: Record<string, unknown> = {
      tenantProfileId: profile._id,
      $addToSet: { enabledProfiles: "tenant" },
    };

    // Only set activeProfileType to tenant if user doesn't already have one
    if (!user?.activeProfileType) {
      updateData.activeProfileType = "tenant";
    }

    await User.findByIdAndUpdate(session.user.id, updateData);

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating tenant profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
