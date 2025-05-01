import drawDot from "./drawDot.js";
import { sleep } from "../utils/sleep.js";

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

  console.log(`Klikám na souřadnice: ${clickX}, ${clickY}`);

  await page.screenshot({
    path: `./public/clicks/seat/before/before_click_${clickX}_${clickY}.png`,
    fullPage: true,
  });
  await page.mouse.click(clickX, clickY);
  await sleep(1000);
  await page.screenshot({
    path: `./public/clicks/seat/after/after_click_${clickX}_${clickY}.png`,
    fullPage: true,
  });

  drawDot(image, avgX, avgY, 7, { r: 0, g: 0, b: 0 }); // černá tečka
}
