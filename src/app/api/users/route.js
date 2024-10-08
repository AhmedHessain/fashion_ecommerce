import { createEdgeRouter } from "next-connect";
import { protect } from "@/backend/controller/authController";
import { getAllUsers } from "@/backend/controller/usersController";
const router = createEdgeRouter();

router.use(protect).get(getAllUsers);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
