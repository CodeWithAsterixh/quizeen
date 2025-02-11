/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/models/User";
import { NextResponse } from "next/server";


export async function POST(req: Request) { 
  try {
      await connectToDatabase()
      const { email } = await req.json();
      const users = await User.find();
      const user = await User.findOne({ email });
      if (users.length===0||!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      await User.deleteOne({email})
  
      return NextResponse.json({ message: "user deleted sucessfully"} ,{status:200});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      return NextResponse.json({ message: "Profile update failed", error: error.message }, { status: 500 });
    }

}
