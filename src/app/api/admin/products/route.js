import { createEdgeRouter } from "next-connect";
import { protect } from "@/backend/controller/authController";
import { getAllProducts, addProduct } from "@/backend/controller/productsController";

const router = createEdgeRouter();

// Admin-only: list products and create products
router.use(protect).get(getAllProducts).post(addProduct);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function POST(request, ctx) {
  return router.run(request, ctx);
}


