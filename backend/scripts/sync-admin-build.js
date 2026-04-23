const fs = require("fs");
const path = require("path");

const sourceDir = path.join(process.cwd(), ".medusa", "server", "public", "admin");
const targetDir = path.join(process.cwd(), "public", "admin");
const customMobileCssSource = path.join(process.cwd(), "src", "admin", "mobile.css");
const customMobileCssTarget = path.join(targetDir, "mobile.css");

if (!fs.existsSync(sourceDir)) {
  console.warn(`[sync-admin-build] Skipping copy because source is missing: ${sourceDir}`);
  process.exit(0);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetDir), { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

if (fs.existsSync(customMobileCssSource)) {
  fs.copyFileSync(customMobileCssSource, customMobileCssTarget);

  const indexHtmlPath = path.join(targetDir, "index.html");

  if (fs.existsSync(indexHtmlPath)) {
    const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");

    if (!indexHtml.includes('/app/mobile.css')) {
      const patchedHtml = indexHtml.replace(
        "</head>",
        '      <link rel="stylesheet" href="/app/mobile.css" />\n    </head>'
      );

      fs.writeFileSync(indexHtmlPath, patchedHtml, "utf8");
    }
  }
}

console.log(`[sync-admin-build] Copied admin build to ${targetDir}`);
