import { Jimp } from "jimp";
import { rgbaToInt } from "@jimp/utils";

export default function drawDot(
  image,
  x,
  y,
  size = 7,
  color = { r: 255, g: 0, b: 0 }
) {
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
