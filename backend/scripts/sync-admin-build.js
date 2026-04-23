const fs = require("fs");
const path = require("path");

const sourceDir = path.join(process.cwd(), ".medusa", "server", "public", "admin");
const targetDir = path.join(process.cwd(), "public", "admin");

if (!fs.existsSync(sourceDir)) {
  console.warn(`[sync-admin-build] Skipping copy because source is missing: ${sourceDir}`);
  process.exit(0);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetDir), { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

console.log(`[sync-admin-build] Copied admin build to ${targetDir}`);
