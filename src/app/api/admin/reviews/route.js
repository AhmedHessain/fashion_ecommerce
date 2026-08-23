import { NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import dbConnect from "@/backend/db";
import Review from "@/backend/model/reviewModel";
import { protect } from "@/backend/controller/authController";

const router = createEdgeRouter();

router.use(protect).get(async (req) => {
  await dbConnect();

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 20);

  const reviews = await Review.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("product", "name mainImage")
    .populate("user", "name email")
    .lean();

  return NextResponse.json(
    {
      results: reviews.length,
      data: reviews,
    },
    { status: 200 }
  );
});

// Admin-only: create a new review manually
router.use(protect).post(async (req) => {
  await dbConnect();
  const body = await req.json();
  const { product, user, rating, review } = body;

  if (!product || !user || !rating || !review) {
    return NextResponse.json(
      { error: "product, user, rating and review are required" },
      { status: 400 }
    );
  }

  const doc = await Review.create({
    product,
    user,
    rating,
    review,
  });

  const populated = await Review.findById(doc._id)
    .populate("product", "name mainImage")
    .populate("user", "name email")
    .lean();

  return NextResponse.json({ data: populated }, { status: 201 });
});

export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function POST(request, ctx) {
  return router.run(request, ctx);
}

