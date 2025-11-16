import Order from "../model/orderModel.js";
import { catchAsync } from "@/backend/utils/captureErrors.js";
import { NextResponse } from "next/server";
import { GetCurrentUser } from "@/app/actions.js";

export const createOrder = catchAsync(async (req, event, next) => {
  const user = await GetCurrentUser();
  if (!user) {
    return NextResponse.json(
      { status: "fail", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { items, shippingAddress, paymentMethod, totalAmount } = body;

  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
    status: "pending",
  });

  return NextResponse.json({ status: "success", order }, { status: 201 });
});

export const getUserOrders = catchAsync(async (req, event, next) => {
  const user = await GetCurrentUser();
  if (!user) {
    return NextResponse.json(
      { status: "fail", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const orders = await Order.find({ user: user._id })
    .sort("-createdAt")
    .populate("items.product", "name mainImage")
    .lean();
  return NextResponse.json({
    status: "success",
    results: orders.length,
    orders,
  });
});
