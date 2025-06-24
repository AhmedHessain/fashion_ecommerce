import { createEdgeRouter } from "next-connect";
import { getAllProducts } from "@/backend/controller/productsController";
const router = createEdgeRouter();

router.get(getAllProducts);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
