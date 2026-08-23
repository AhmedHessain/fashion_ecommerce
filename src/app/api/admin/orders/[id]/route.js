import { NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import dbConnect from "@/backend/db";
import Order from "@/backend/model/orderModel";
import { protect } from "@/backend/controller/authController";

const router = createEdgeRouter();

// Admin-only: change order status
router.use(protect).patch(async (req, event) => {
  await dbConnect();

  const { id } = event.params;
  const body = await req.json();
  const { status } = body;

  if (!status || typeof status !== "string") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await Order.findById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  order.status = status;
  await order.save();

  const updated = await Order.findById(order._id)
    .populate("items.product", "name price mainImage")
    .populate("user", "name email")
    .lean();

  return NextResponse.json(updated, { status: 200 });
});

export async function PATCH(request, ctx) {
  return router.run(request, ctx);
}


