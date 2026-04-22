import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.status(200).json({
    ok: true,
    service: "cocoa-mocha-backend",
    message: "Backend is running.",
    health: "/health",
    publicConfig: "/public-config",
  });
}
