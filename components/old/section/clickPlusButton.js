// Function to call zoom_plus 5 times
import { sleep } from "../utils/sleep.js";
export async function clickPlusButtonFiveTimes(page) {
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      svg_sektor_click(); // Zavolání funkce přímo v prohlížeči
    });
    await sleep(1000);
  }
  console.log("Called zoom_plus 5 times");
}
