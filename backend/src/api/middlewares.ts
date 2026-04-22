import {
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";

const rootStatusMiddleware = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (req.path !== "/") {
    return next();
  }

  res.status(200).json({
    ok: true,
    service: "cocoa-mocha-backend",
    message: "Backend is running.",
    health: "/health",
    publicConfig: "/public-config",
  });
};

export default defineMiddlewares([
  {
    matcher: "/*",
    methods: ["GET"],
    middlewares: [rootStatusMiddleware],
  },
]);
