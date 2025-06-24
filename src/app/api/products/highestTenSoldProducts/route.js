import { createEdgeRouter } from "next-connect";
import { getHighestTenSoldProducts } from "@/backend/controller/productsController";
const router = createEdgeRouter();

router.get(getHighestTenSoldProducts);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
