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

  res
    .status(200)
    .type("html")
    .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cocoa Mocha Backend</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7efe5;
        --card: #fffaf4;
        --ink: #2f1b12;
        --muted: #7d5b49;
        --accent: #a55233;
        --accent-strong: #7a371f;
        --border: rgba(122, 55, 31, 0.14);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Georgia, "Times New Roman", serif;
        background:
          radial-gradient(circle at top, rgba(255, 214, 170, 0.7), transparent 34%),
          linear-gradient(180deg, #fff8ef 0%, var(--bg) 100%);
        color: var(--ink);
      }

      main {
        width: min(720px, 100%);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 24px 64px rgba(69, 33, 15, 0.12);
      }

      .eyebrow {
        margin: 0 0 10px;
        color: var(--accent);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 6vw, 3.4rem);
        line-height: 1.05;
      }

      p {
        margin: 0;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.7;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin: 20px 0 24px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(165, 82, 51, 0.09);
        color: var(--accent-strong);
        font-weight: 700;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #2aa04a;
        box-shadow: 0 0 0 6px rgba(42, 160, 74, 0.14);
      }

      .links {
        display: grid;
        gap: 12px;
        margin-top: 28px;
      }

      a {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border: 1px solid var(--border);
        border-radius: 16px;
        color: inherit;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.72);
      }

      a:hover {
        border-color: rgba(122, 55, 31, 0.28);
        transform: translateY(-1px);
      }

      .label {
        font-weight: 700;
      }

      .value {
        color: var(--muted);
        word-break: break-all;
      }

      @media (max-width: 640px) {
        main {
          padding: 24px;
          border-radius: 20px;
        }

        a {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Cocoa Mocha API</p>
      <h1>Backend online</h1>
      <p>
        This service powers the Cocoa Mocha storefront. The customer-facing site
        is on Vercel, while this backend serves health, catalog, and store API endpoints.
      </p>
      <div class="status">
        <span class="dot" aria-hidden="true"></span>
        Service is running correctly
      </div>
      <div class="links">
        <a href="/health">
          <span class="label">Health check</span>
          <span class="value">/health</span>
        </a>
        <a href="/public-config">
          <span class="label">Public config</span>
          <span class="value">/public-config</span>
        </a>
      </div>
    </main>
  </body>
</html>`);
};

export default defineMiddlewares([
  {
    matcher: "/*",
    methods: ["GET"],
    middlewares: [rootStatusMiddleware],
  },
]);
