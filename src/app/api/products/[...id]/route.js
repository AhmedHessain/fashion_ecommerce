import { createEdgeRouter } from "next-connect";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/backend/controller/productsController";
const router = createEdgeRouter();

router.get(getProductById).patch(updateProduct).delete(deleteProduct);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
export async function PATCH(request, ctx) {
  return router.run(request, ctx);
}
export async function DELETE(request, ctx) {
  return router.run(request, ctx);
}
