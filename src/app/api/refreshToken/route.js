import { createEdgeRouter } from "next-connect";
import { refreshAccessToken } from "@/backend/controller/refreshTokenController";

const router = createEdgeRouter();

router.post(refreshAccessToken);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
