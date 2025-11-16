import { NextResponse } from "next/server";
import dbConnect from "@/backend/db";
import Order from "@/backend/model/orderModel";
import { getUserFromAccessOrRefreshToken } from "@/backend/utils/auth";

function getStepCount(status) {
  const stepMap = [
    "pending",
    "ordered",
    "paid",
    "shipped",
    "out-for-delivery",
    "delivered",
    "completed",
    "cancelled",
  ];

  if (status === "cancelled") return stepMap.length;
  const index = stepMap.indexOf(status);
  return index >= 0 ? index + 1 : 0;
}

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const user = await getUserFromAccessOrRefreshToken();

    const order = await Order.findOne({ _id: params.id, user: user._id })
      .populate("items.product", "name price mainImage")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.progress = {
      stepCount: getStepCount(order.status),
      totalSteps: 7,
      percentage: Math.min((getStepCount(order.status) / 7) * 100, 100),
    };

    return NextResponse.json(order);
  } catch (err) {
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json(
      { error: err?.message || "Server error while fetching order" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  await dbConnect();
  try {
    const user = await getUserFromAccessOrRefreshToken();
    const body = await req.json();
    const { status } = body;

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.status = status;

    await order.save();

    const updated = await Order.findById(order._id)
      .populate("items.product", "name price mainImage")
      .lean();

    updated.progress = {
      stepCount: getStepCount(updated.status),
      totalSteps: 7,
      percentage: Math.min((getStepCount(updated.status) / 7) * 100, 100),
    };

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/orders/[id] error:", err);
    const statusCode = /Unauthorized/i.test(err?.message) ? 401 : 500;
    return NextResponse.json(
      { error: err?.message || "Server error while updating order" },
      { status: statusCode }
    );
  }
}
