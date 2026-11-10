import { readFileSync, existsSync, readdirSync } from "node:fs";

const required = ["index.html", "assets/css/pages.css", "assets/js/pages.js", "assets/media/ctrl-tech-mark.svg"];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error("Missing active storefront files:", missing.join(", "));
  process.exit(1);
}

const html = readFileSync("index.html", "utf8");
const css = readFileSync("assets/css/pages.css", "utf8");
const js = readFileSync("assets/js/pages.js", "utf8");
for (const asset of ["assets/css/pages.css", "assets/js/pages.js", "assets/media/ctrl-tech-mark.svg"]) {
  if (!html.includes(asset)) {
    console.error("index.html does not reference:", asset);
    process.exit(1);
  }
}

const openBraces = (css.match(/{/g) || []).length;
const closeBraces = (css.match(/}/g) || []).length;
if (openBraces !== closeBraces) {
  console.error("Active CSS block delimiters are unbalanced.");
  process.exit(1);
}
if (!js.includes("const products=") || !js.includes("renderCatalog()")) {
  console.error("Expected active catalogue rendering was not found.");
  process.exit(1);
}
const htmlFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) walk(dir + "/" + entry.name);
    else if (entry.name.endsWith(".html")) htmlFiles.push(dir + "/" + entry.name);
  }
}
walk(".");
if (htmlFiles.length < 40) {
  console.error("Expected multipage storefront files; found:", htmlFiles.length);
  process.exit(1);
}
console.log("Static storefront structure checks passed (" + htmlFiles.length + " HTML pages).");
