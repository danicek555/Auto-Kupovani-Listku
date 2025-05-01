import { Jimp } from "jimp";
import { intToRGBA } from "@jimp/utils";
import { rgbaToInt } from "@jimp/utils";
import isFreeSeatColor from "./isFreeSeatColor.js";

export default function floodFill(x, y, cluster, visited, image) {
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
    if (!isFreeSeatColor(r, g, b)) continue;

    visited.add(key);
    cluster.push({ x, y });

    stack.push({ x: x + 1, y });
    stack.push({ x: x - 1, y });
    stack.push({ x, y: y + 1 });
    stack.push({ x, y: y - 1 });
  }
}
