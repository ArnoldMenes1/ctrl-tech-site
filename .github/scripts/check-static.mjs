import { readFileSync, existsSync } from "node:fs";

const required = ["index.html", "assets/css/style.css", "assets/js/app.js", "assets/media/ctrl-tech-mark.svg"];
const missing = required.filter((path) => !existsSync(path));
if (missing.length) {
  console.error("Missing required storefront files:", missing.join(", "));
  process.exit(1);
}

const html = readFileSync("index.html", "utf8");
const css = readFileSync("assets/css/style.css", "utf8");
const js = readFileSync("assets/js/app.js", "utf8");

for (const asset of ["assets/css/style.css", "assets/js/app.js", "assets/media/ctrl-tech-mark.svg"]) {
  if (!html.includes(asset)) {
    console.error("index.html does not reference:", asset);
    process.exit(1);
  }
}

const openBraces = (css.match(/{/g) || []).length;
const closeBraces = (css.match(/}/g) || []).length;
if (openBraces !== closeBraces) {
  console.error("CSS block delimiters are unbalanced.");
  process.exit(1);
}

if (!js.includes("ctrltech-cart") || !js.includes("data-open-cart")) {
  console.error("Expected local cart interactions were not found.");
  process.exit(1);
}

console.log("Static storefront structure checks passed.");
