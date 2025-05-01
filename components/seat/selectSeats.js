import { sleep } from "../utils/sleep.js";
import { getMAll } from "../getSeatData/mAll.js";
import { getM } from "../getSeatData/mAll.js";
import { getSAll } from "../getSeatData/mAll.js";
import { mergeData } from "../getSeatData/mergeM.js";
import { mergeSectorData } from "../getSeatData/mergeM.js";
import { appendPricesFromPriceCategories } from "../getSeatData/mergeM.js";
import { getGPerformance } from "../getSeatData/mAll.js";
import { seatClick } from "../getSeatData/seatClick.js";
export async function selectSeats(page) {
  console.log("Čekám na načtení canvasu...");
  await page.waitForSelector("#canvas", { visible: true, timeout: 5000 });
  await page.waitForFunction(() => {
    const canvas = document.querySelector("#canvas");
    return canvas && canvas.width > 0 && canvas.height > 0;
  });

  const canvas = await page.$("#canvas");
  await sleep(2000); // místo sleep()

  await page.screenshot({
    path: "./public/screenshots/3_site_with_seats.png",
    fullPage: true,
  });
  await canvas.screenshot({ path: "./public/screenshots/4_canvas.png" });

  console.log("Načetla se mapa a udělal se screenshot");

  // await extractNumbersFromImage("./public/screenshots/4_canvas.png")
  //   .then(async (numbers) => {
  //     console.log("Výstup OCR:", numbers);

  //     // Převod na čísla a filtrování platných hodnot (1 až 500)
  //     const validNumbers = numbers
  //       .map((num) => parseInt(num, 10)) // Převede řetězce na čísla
  //       .filter((num) => !isNaN(num) && num > 100 && num <= 500); // Filtruje jen čísla v rozmezí 1-500

  //     console.log("Validní čísla:", validNumbers); // Debugging

  //     if (validNumbers.some((num) => num > 100 && num < 500)) {
  //       console.log("Jsou tam sekce!");
  //       await selectSections(page);
  //     } else {
  //       console.log("Nebyly nalezeny sekce!");
  //     }
  //   })
  //   .catch((err) => console.error("Chyba při OCR:", err));

  // await clickOnSection(page, "999");
  // await clickPlusButtonFiveTimes(page);
  await getMAll(page);
  await getM(page);
  await getSAll(page);
  await getGPerformance(page);
  await mergeData();
  await mergeSectorData();
  await appendPricesFromPriceCategories();
  await seatClick(page);

  // console.log("Detekuji volná místa");
  // const { image, clusters } = await detectFreeSeats(
  //   "./public/screenshots/4_canvas.png"
  // );

  // if (clusters.length === 0) {
  //   console.log("Žádná volná místa nenalezena!");
  //   return;
  // }

  // // Kliknutí na první 4 volná místa
  // for (let i = 0; i < Math.min(4, clusters.length); i++) {
  //   await clickOnCluster(page, canvas, clusters[i], image);
  // }

  // await image.write("./public/screenshots/5_blue_free_spots.png");
  // console.log(
  //   "Debug obrázek uložen jako ./public/screenshots/5_blue_free_spots.png"
  // );

  // Click seats quickly
  // for (let i = 0; i < Math.min(4, clusters.length); i++) {
  //   await clickOnCluster(page, canvas, clusters[i], image);
  //   await sleep(500);
  // }

  // await page.waitForSelector("#hladisko-basket-btn", {
  //   visible: true,
  //   timeout: 5000,
  // });
  // await page.click("#hladisko-basket-btn");
}
