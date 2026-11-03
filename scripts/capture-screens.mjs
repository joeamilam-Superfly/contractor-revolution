import { mkdir } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = path.resolve("public");
const appDir = path.join(root, "images", "app");
await mkdir(appDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--font-render-hinting=none"],
});

const page = await browser.newPage();
const screens = ["dashboard", "time", "work-order", "pto", "billing", "weekly"];
const sizes = [
  { name: "desktop", width: 1280, height: 760 },
  { name: "phone", width: 390, height: 844 },
];

for (const screen of screens) {
  for (const size of sizes) {
    await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 2 });
    const file = path.resolve(`mocks/app.html`);
    await page.goto(`file://${file}?screen=${screen}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector(`html[data-screen="${screen}"]`);
    const png = await page.screenshot({ type: "png" });
    const out = path.join(appDir, `${screen}-${size.name}.webp`);
    await sharp(png).webp({ quality: 76 }).toFile(out);
    const meta = await sharp(out).metadata();
    console.log(`${screen}-${size.name} ${meta.width}x${meta.height}`);
  }
}

await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(`file://${path.resolve("mocks/og.html")}`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const og = await page.screenshot({ type: "png" });
await sharp(og).png({ compressionLevel: 9 }).toFile(path.join(root, "og.png"));
const ogMeta = await sharp(path.join(root, "og.png")).metadata();
console.log(`og ${ogMeta.width}x${ogMeta.height}`);

await browser.close();
