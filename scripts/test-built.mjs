import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PROMISES } from "../shared/copy.mjs";

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

const dist = path.resolve("dist");
const files = await htmlFiles(dist);
assert.ok(files.length >= 6, "expected a page per route");
const html = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");

const banned = [
  "\u2014",
  "\u2013",
  "contractor-revolution.com",
  "contractorrevolution.com",
  "Heath",
  "commission",
  "revolutionize",
  "seamless",
  "unlock",
  "cutting-edge",
  "next-level",
  "STRIPE_SECRET",
  "sk_live",
  "sk_test",
];
for (const word of banned) {
  assert.equal(html.includes(word), false, `built site contains ${JSON.stringify(word)}`);
}

const required = [
  "https://www.contractor-revolution.co",
  "864-437-1827",
  "info@isomtechnologies.com",
  "support@isomtechnologies.com",
  "7205 US 76",
  "Pendleton",
  "29670",
  "Isom Technologies",
  "Jobber",
  "JobTread",
  'data-netlify="true"',
  'rel="canonical"',
  'property="og:image"',
  'property="og:url"',
  "/og.png",
  "$239",
  "$329",
  "$429",
  "$529",
  "$729",
  "15%",
  ...PROMISES,
];
for (const text of required) {
  assert.equal(html.includes(text), true, `built site is missing ${JSON.stringify(text)}`);
}

const order = await readFile(path.join(dist, "order.html"), "utf8");
assert.match(order, /name="form-name"/);
assert.match(order, /name="company"/);
assert.match(order, /name="bot-field"/);
assert.match(order, /id="quote"/);

assert.equal(html.includes("contractor-revolution.co/pricing.html"), false);
assert.equal(html.includes("contractor-revolution.co/index.html"), false);
assert.match(html, /rel="canonical" href="https:\/\/www\.contractor-revolution\.co\/"/);
assert.match(html, /rel="canonical" href="https:\/\/www\.contractor-revolution\.co\/pricing"/);
assert.match(html, /rel="canonical" href="https:\/\/www\.contractor-revolution\.co\/order"/);

const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
assert.match(robots, /sitemap-index\.xml/);

const sitemapIndex = await readFile(path.join(dist, "sitemap-index.xml"), "utf8");
assert.match(sitemapIndex, /contractor-revolution\.co/);
const sitemap = await readFile(path.join(dist, "sitemap-0.xml"), "utf8");
assert.match(sitemap, /https:\/\/www\.contractor-revolution\.co\/pricing/);
assert.equal(sitemap.includes("contractor-revolution.com"), false);
assert.equal(sitemap.includes("/order/thanks"), false);
assert.equal(sitemap.includes(".html"), false);

console.log(`built site checks passed (${files.length} html files)`);
