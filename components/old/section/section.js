import { Jimp } from "jimp";
import { intToRGBA, rgbaToInt } from "@jimp/utils";
import { sleep } from "../utils/sleep.js";
import { extractNumbersFromImage } from "../utils/extractNumbers.js";

export default function isFreeSectionColor(r, g, b) {
  const greenDominates = g > r + 15 && g > b + 15 && g > 50;
  const redDominates = r > g + 15 && r > b + 15 && r > 50;
  const blueDominates = b > r + 15 && b > g + 15 && b > 50;
  const yellowDominates = r > 200 && g > 200 && b < 100;
  return greenDominates || redDominates || blueDominates || yellowDominates;
}

export function floodFill(x, y, cluster, visited, image) {
  const stack = [{ x, y }];
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  while (stack.length > 0) {
    const { x, y } = stack.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;

    const color = image.getPixelColor(x, y);
    const { r, g, b } = intToRGBA(color);
    if (!isFreeSectionColor(r, g, b)) continue;

    visited.add(key);
    cluster.push({ x, y });

    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }
}

export function drawDot(image, x, y, size = 7, color = { r: 0, g: 0, b: 255 }) {
  const dotColor = rgbaToInt(color.r, color.g, color.b, 255);
  for (let dx = -Math.floor(size / 2); dx <= Math.floor(size / 2); dx++) {
    for (let dy = -Math.floor(size / 2); dy <= Math.floor(size / 2); dy++) {
      const px = x + dx;
      const py = y + dy;
      if (
        px >= 0 &&
        py >= 0 &&
        px < image.bitmap.width &&
        py < image.bitmap.height
      ) {
        image.setPixelColor(dotColor, px, py);
      }
    }
  }
}

export async function detectFreeSections(pathToScreenshot) {
  const image = await Jimp.read(pathToScreenshot);
  //image.contrast(0.3);

  const width = image.bitmap.width;
  const height = image.bitmap.height;
  let clusters = [];
  let visited = new Set();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited.has(`${x},${y}`)) continue;
      const color = image.getPixelColor(x, y);
      const { r, g, b } = intToRGBA(color);
      if (isFreeSectionColor(r, g, b)) {
        let cluster = [];
        floodFill(x, y, cluster, visited, image);
        if (cluster.length >= 100) {
          clusters.push(cluster);
        }
      }
    }
  }

  for (const cluster of clusters) {
    for (const { x, y } of cluster) {
      const pureRed = rgbaToInt(255, 0, 0, 255);
      image.setPixelColor(pureRed, x, y);
    }
  }
  await image.write("./public/screenshots/5_red_free_sections.png");
  return { image, clusters };
}

export async function clickOnCluster(page, canvas, cluster, image) {
  const avgX = Math.round(
    cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length
  );
  const avgY = Math.round(
    cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length
  );

  const canvasBox = await canvas.boundingBox();
  const clickX = canvasBox.x + avgX;
  const clickY = canvasBox.y + avgY;

  console.log(`Klikám na sekci se souřadnicemi: ${clickX}, ${clickY}`);

  await page.screenshot({
    path: `./public/clicks/section/before/before_click_${clickX}_${clickY}.png`,
    fullPage: true,
  });
  await page.mouse.click(clickX, clickY);
  await sleep(1000);
  await page.screenshot({
    path: `./public/clicks/section/after/after_click_${clickX}_${clickY}.png`,
    fullPage: true,
  });

  drawDot(image, avgX, avgY, 10, { r: 0, g: 0, b: 0 });
  await sleep(1000);
}

export async function selectSections(page) {
  console.log("Jsem na sekcích");
  const canvas = await page.$("#canvas");

  await page.screenshot({
    path: "./public/screenshots/3_site_with_sections.png",
    fullPage: true,
  });
  await canvas.screenshot({
    path: "./public/screenshots/4_canvas_with_sections.png",
  });

  const { image, clusters } = await detectFreeSections(
    "./public/screenshots/4_canvas_with_sections.png"
  );

  if (clusters.length === 0) {
    console.log("Žádná volné sekce nenalezeny!");
    return;
  }

  for (let i = 0; i < Math.min(1, clusters.length); i++) {
    await clickOnCluster(page, canvas, clusters[i], image);
  }

  await image.write("./public/screenshots/6_black_dot_section.png");
  console.log(
    "Debug obrázek uložen jako ./public/screenshots/6_black_dot_section.png"
  );
}
