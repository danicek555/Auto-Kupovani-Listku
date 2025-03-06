import { Jimp } from "jimp";
import floodFill from "../utils/floodFill.js";
import isFreeSeatColor from "../utils/isFreeSeatColor.js";
import { intToRGBA } from "@jimp/utils";
import { rgbaToInt } from "@jimp/utils";

export async function detectFreeSeats(pathToScreenshot) {
  const image = await Jimp.read(pathToScreenshot);
  image.contrast(0.3);

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  let clusters = [];
  let visited = new Set();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited.has(`${x},${y}`)) continue;
      const color = image.getPixelColor(x, y);
      const { r, g, b } = intToRGBA(color);
      if (isFreeSeatColor(r, g, b)) {
        let cluster = [];
        floodFill(x, y, cluster, visited, image);
        if (cluster.length >= 10) {
          clusters.push(cluster);
        }
      }
    }
  }

  for (const cluster of clusters) {
    for (const { x, y } of cluster) {
      image.setPixelColor(rgbaToInt(0, 0, 255, 255), x, y); // modrá
    }
  }

  return { image, clusters };
}
