import { NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import dbConnect from "@/backend/db";
import Order from "@/backend/model/orderModel";
import { protect } from "@/backend/controller/authController";

const router = createEdgeRouter();

router.use(protect).get(async () => {
  await dbConnect();

  const [totalOrders, revenueAgg, statusAgg, monthlyAgg, recentOrders] =
    await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email")
        .lean(),
    ]);

  const totalRevenue =
    revenueAgg && revenueAgg.length > 0 ? revenueAgg[0].revenue : 0;

  const statusCounts = statusAgg.reduce((acc, cur) => {
    acc[cur._id || "unknown"] = cur.count;
    return acc;
  }, {});

  const monthlySales = monthlyAgg.map((entry) => ({
    year: entry._id.year,
    month: entry._id.month,
    revenue: entry.revenue,
    orders: entry.orders,
  }));

  return NextResponse.json(
    {
      totalOrders,
      totalRevenue,
      statusCounts,
      monthlySales,
      recentOrders,
    },
    { status: 200 }
  );
});

export async function GET(request, ctx) {
  return router.run(request, ctx);
}


