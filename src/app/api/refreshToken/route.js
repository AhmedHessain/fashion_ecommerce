import { createEdgeRouter } from "next-connect";
import { refreshAccessToken } from "@/backend/controller/refreshTokenController";
const router = createEdgeRouter();

router.get(refreshAccessToken);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
