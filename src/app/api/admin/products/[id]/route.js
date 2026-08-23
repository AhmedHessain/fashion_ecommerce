import { createEdgeRouter } from "next-connect";
import { protect } from "@/backend/controller/authController";
import { updateProduct, deleteProduct } from "@/backend/controller/productsController";

const router = createEdgeRouter();

// Admin-only: update or delete products
router.use(protect).patch(updateProduct).delete(deleteProduct);

export async function PATCH(request, ctx) {
  return router.run(request, ctx);
}

export async function DELETE(request, ctx) {
  return router.run(request, ctx);
}


