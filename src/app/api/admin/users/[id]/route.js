import { createEdgeRouter } from "next-connect";
import { protect } from "@/backend/controller/authController";
import dbConnect from "@/backend/db";
import User from "@/backend/model/userModel";
import { NextResponse } from "next/server";

const router = createEdgeRouter();

// Admin-only: update or delete a user
router.use(protect).patch(async (req, event) => {
  await dbConnect();
  const { id } = event.params;
  const body = await req.json();

  const allowedFields = ["name", "email", "role"];
  const updateData = {};
  for (const key of allowedFields) {
    if (key in body) updateData[key] = body[key];
  }

  const updated = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated }, { status: 200 });
});

router.use(protect).delete(async (req, event) => {
  await dbConnect();
  const { id } = event.params;

  const deleted = await User.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(null, { status: 204 });
});

export async function PATCH(request, ctx) {
  return router.run(request, ctx);
}

export async function DELETE(request, ctx) {
  return router.run(request, ctx);
}


