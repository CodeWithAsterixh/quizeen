import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/withAuth";
import { getUserFromRequest } from "@/middleware/withAuth";

export async function DELETE(req: NextRequest) {
  // Verify authentication and get user info
  const authResponse = await withAuth(req);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  try {
    await connectToDatabase();
    const { userId, role } = getUserFromRequest(req);
    const { email } = await req.json();

    // Only allow users to delete their own account or admins to delete any account
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (role !== 'admin' && user._id.toString() !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this account" },
        { status: 403 }
      );
    }

    await User.deleteOne({ _id: user._id });

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
