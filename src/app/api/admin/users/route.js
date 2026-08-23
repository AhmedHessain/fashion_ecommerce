import { createEdgeRouter } from "next-connect";
import { protect } from "@/backend/controller/authController";
import { getAllUsers } from "@/backend/controller/usersController";
import dbConnect from "@/backend/db";
import User from "@/backend/model/userModel";
import { NextResponse } from "next/server";

const router = createEdgeRouter();

// Admin-only: list users (reuses existing controller)
router.use(protect).get(getAllUsers);

// Admin-only: create a new user
router.use(protect).post(async (req) => {
  await dbConnect();
  const body = await req.json();
  const { name, email, password, role = "user" } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email and password are required" },
      { status: 400 }
    );
  }

  const user = await User.create({ name, email, password, role });

  return NextResponse.json(
    {
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        signedUpAt: user.signedUpAt,
      },
    },
    { status: 201 }
  );
});

export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function POST(request, ctx) {
  return router.run(request, ctx);
}


