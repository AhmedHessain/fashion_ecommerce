import { createEdgeRouter } from "next-connect";
import { getRecommendedProducts } from "@/backend/controller/productsController";
const router = createEdgeRouter();

router.get(getRecommendedProducts);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
