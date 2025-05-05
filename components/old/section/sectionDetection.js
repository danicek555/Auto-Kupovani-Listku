import { Jimp } from "jimp";
import { intToRGBA } from "@jimp/utils";
import { rgbaToInt } from "@jimp/utils";
import { sleep } from "../../utils/sleep.js";

function isSectionColor(r, g, b) {
  // First check if it's not a white/light background
  if (r > 240 && g > 240 && b > 240) return false;

  // Check for any distinct colored section (green, red, yellow, light blue)
  const isGreen = g > r + 30 && g > b + 30 && g > 100 && g < 230;
  const isRed = r > g + 30 && r > b + 30 && r > 100 && r < 230;
  const isYellow = r > 180 && g > 180 && b < 100;
  const isLightBlue = b > 150 && r < 180 && g < 180;
  const isSalmon = r > 200 && g > 100 && g < 180 && b < 180;

  return isGreen || isRed || isYellow || isLightBlue || isSalmon;
}

function floodFillSection(x, y, cluster, visited, image) {
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
    if (!isSectionColor(r, g, b)) continue;

    visited.add(key);
    cluster.push({ x, y });

    // Check neighboring pixels with larger steps for efficiency
    stack.push({ x: x + 2, y });
    stack.push({ x: x - 2, y });
    stack.push({ x, y: y + 2 });
    stack.push({ x, y: y - 2 });
  }
}

export async function detectSections(pathToScreenshot) {
  const image = await Jimp.read(pathToScreenshot);
  image.contrast(0.3);

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  let sections = [];
  let visited = new Set();

  // Scan the image with larger steps for efficiency
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      if (visited.has(`${x},${y}`)) continue;

      const color = image.getPixelColor(x, y);
      const { r, g, b } = intToRGBA(color);

      if (isSectionColor(r, g, b)) {
        let cluster = [];
        floodFillSection(x, y, cluster, visited, image);

        // Adjusted threshold for sections
        if (cluster.length >= 300) {
          sections.push(cluster);
        }
      }
    }
  }

  // Mark ALL detected sections in RED for consistency
  for (const section of sections) {
    for (const { x, y } of section) {
      image.setPixelColor(rgbaToInt(255, 0, 0, 255), x, y);
    }
  }

  return { image, sections };
}

export async function clickOnSection(page, canvas, section) {
  const avgX = Math.round(
    section.reduce((sum, p) => sum + p.x, 0) / section.length
  );
  const avgY = Math.round(
    section.reduce((sum, p) => sum + p.y, 0) / section.length
  );

  const canvasBox = await canvas.boundingBox();
  const clickX = canvasBox.x + avgX;
  const clickY = canvasBox.y + avgY;

  console.log(`Klikám na sekci na souřadnicích: ${clickX}, ${clickY}`);

  // Take before screenshot
  await page.screenshot({
    path: `./public/clicks/before/before_section_click_${clickX}_${clickY}.png`,
    fullPage: true,
  });

  // Move mouse and click
  await page.mouse.move(clickX, clickY);
  await sleep(200);
  await page.mouse.click(clickX, clickY);

  // Take after screenshot
  await page.screenshot({
    path: `./public/clicks/after/after_section_click_${clickX}_${clickY}.png`,
    fullPage: true,
  });

  return true;
}
