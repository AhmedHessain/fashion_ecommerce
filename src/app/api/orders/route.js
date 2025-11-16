import { NextResponse } from "next/server";
import dbConnect from "@/backend/db";
import Order from "@/backend/model/orderModel";
import Product from "@/backend/model/productModel";
import User from "@/backend/model/userModel";
import { getUserFromAccessOrRefreshToken } from "@/backend/utils/auth";

export async function POST(req) {
  await dbConnect();
  try {
    const user = await getUserFromAccessOrRefreshToken();
    const body = await req.json();
    const {
      addressId,
      newAddress,
      saveNewAddress = false,
      paymentMethod = "COD",
    } = body;

    const fullUser = await User.findById(user._id).populate("cart.product");
    if (!fullUser || !fullUser.cart?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Address
    let shippingAddress;
    if (addressId) {
      shippingAddress = fullUser.addresses.id(addressId);
      if (!shippingAddress) {
        return NextResponse.json(
          { error: "Invalid addressId" },
          { status: 400 }
        );
      }
    } else if (newAddress) {
      const {
        firstName,
        lastName,
        phone,
        city,
        country,
        postalCode,
        streetAddress,
      } = newAddress;
      if (
        ![
          firstName,
          lastName,
          phone,
          streetAddress,
          city,
          country,
          postalCode,
        ].every(Boolean)
      ) {
        return NextResponse.json(
          { error: "Incomplete newAddress" },
          { status: 400 }
        );
      }
      shippingAddress = {
        apartment: newAddress.apartment || "",
        firstName,
        lastName,
        phone,
        streetAddress,
        city,
        country,
        postalCode,
      };
      if (saveNewAddress) fullUser.addresses.push(shippingAddress);
    } else {
      return NextResponse.json(
        { error: "Shipping address required" },
        { status: 400 }
      );
    }

    // Items
    const items = [];
    let totalAmount = 0;
    for (const ci of fullUser.cart) {
      const productDoc = ci.product || (await Product.findById(ci.product));
      if (!productDoc) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      if (productDoc.quantity < ci.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for ${productDoc.name}` },
          { status: 400 }
        );
      }
      const price = productDoc.priceAfterDiscount ?? productDoc.price;
      items.push({ product: productDoc._id, quantity: ci.quantity, price });
      totalAmount += price * ci.quantity;
    }
    totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;

    const order = await Order.create({
      user: fullUser._id,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
    });

    fullUser.cart = [];
    await fullUser.save();

    await order.populate("items.product", "name price mainImage");
    return NextResponse.json(order.toObject(), { status: 201 });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    const status = /Unauthorized/i.test(err?.message) ? 401 : 500;
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status }
    );
  }
}

export async function GET() {
  await dbConnect();
  try {
    const user = await getUserFromAccessOrRefreshToken();
    const orders = await Order.find({ user: user._id })
      .populate("items.product", "name price mainImage")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    const status = /Unauthorized/i.test(err?.message) ? 401 : 500;
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status }
    );
  }
}
