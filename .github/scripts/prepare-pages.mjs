import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || "_site");
const base = "/ctrl-tech-site";
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}

walk(root);
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replaceAll('href="/assets/', 'href="' + base + '/assets/');
  html = html.replaceAll('src="/assets/', 'src="' + base + '/assets/');
  fs.writeFileSync(file, html);
}

const jsPath = path.join(root, "assets/js/pages.js");
let js = fs.readFileSync(jsPath, "utf8");
const replacements = [
  [
    'const $=s=>document.querySelector(s), rawPath=location.pathname, path=',
    'const basePath=location.pathname.startsWith("' + base + '")?"' + base + '":"", $=s=>document.querySelector(s), rawPath=(location.pathname.slice(basePath.length)||"/"), path='
  ],
  [
    'href="/produit/\'+p.id+'/"',
    'href="/produit/detail/?slug=\'+encodeURIComponent(p.id)+ '"'
  ],
  [
    'href="/categories/\'+c[0]+'/"',
    'href="/categories/detail/?slug=\'+encodeURIComponent(c[0])+ '"'
  ],
  [
    'href="/marques/\'+b.toLowerCase()+'/"',
    'href="/marques/detail/?slug=\'+encodeURIComponent(b)+ '"'
  ]
];
for (const [before, after] of replacements) {
  if (!js.includes(before)) throw new Error("Expected routing pattern not found: " + before);
  js = js.replace(before, after);
}
const marker = '$("#site-footer").innerHTML=footer;document.title=';
if (!js.includes(marker)) throw new Error("Page rendering marker not found");
js = js.replace(marker, '$("#site-footer").innerHTML=footer;if(basePath){document.querySelectorAll(\'a[href^="/"]\').forEach(a=>a.setAttribute("href",basePath+a.getAttribute("href")));}document.title=');
fs.writeFileSync(jsPath, js);
fs.writeFileSync(path.join(root, ".nojekyll"), "");
console.log("Prepared " + htmlFiles.length + " HTML pages for GitHub Pages.");
