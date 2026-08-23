import { NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import dbConnect from "@/backend/db";
import Review from "@/backend/model/reviewModel";
import { protect } from "@/backend/controller/authController";

const router = createEdgeRouter();

// Admin-only: update or delete reviews
router.use(protect).patch(async (req, event) => {
  await dbConnect();
  const { id } = event.params;
  const body = await req.json();

  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (typeof body.review === "string") {
    review.review = body.review;
  }
  if (typeof body.rating === "number") {
    review.rating = body.rating;
  }

  await review.save();

  const updated = await Review.findById(id)
    .populate("product", "name mainImage")
    .populate("user", "name email")
    .lean();

  return NextResponse.json({ data: updated }, { status: 200 });
});

router.use(protect).delete(async (req, event) => {
  await dbConnect();
  const { id } = event.params;

  const doc = await Review.findByIdAndDelete(id);
  if (!doc) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  return NextResponse.json(null, { status: 204 });
});

export async function PATCH(request, ctx) {
  return router.run(request, ctx);
}

export async function DELETE(request, ctx) {
  return router.run(request, ctx);
}


