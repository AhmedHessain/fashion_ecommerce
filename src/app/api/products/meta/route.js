import { createEdgeRouter } from "next-connect";
import { getProductMetadata } from "@/backend/controller/productsController";
const router = createEdgeRouter();

router.get(getProductMetadata);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
