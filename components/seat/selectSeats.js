import { sleep } from "../utils/sleep.js";
import { getMAll } from "../getSeatData/getMALL.js";
import { getM } from "../getSeatData/getM.js";
import { getSAll } from "../getSeatData/getSALL.js";
import { mergeData } from "../getSeatData/mergeData.js";
import { mergeSectorData } from "../getSeatData/mergeSectorData.js";
import { appendPricesFromPriceCategories } from "../getSeatData/appendPricesFromPriceCategories.js";
import { getGPerformance } from "../getSeatData/getGPerformance.js";
import { seatClick } from "../seat/seatClick.js";
export async function selectSeats(page) {
  if (process.env.CONSOLE_LOG === "true") {
    console.log("Čekám na načtení canvasu...");
  }
  await page
    .waitForSelector("#canvas", { visible: true, timeout: 5000 })
    .catch((err) =>
      console.error(
        "❌ Element 'canvas' v selectSeats.js nebyl nalezen",
        err.message
      )
    );
  await page
    .waitForFunction(
      () => {
        const canvas = document.querySelector("#canvas");
        return canvas && canvas.width > 0 && canvas.height > 0;
      },
      { timeout: 5000 }
    )
    .catch((err) =>
      console.error(
        "❌ Element 'canvas' v selectSeats.js nebyl nalezen",
        err.message
      )
    );

  const canvas = await page.$("#canvas");
  //await sleep(2000); // místo sleep()

  if (process.env.SCREENSHOTS === "true") {
    await page
      .screenshot({
        path: "./public/screenshots/1_site_with_seats.png",
        fullPage: true,
      })
      .catch((err) =>
        console.error(
          "❌ Screenshot 1_site_with_seats.png selhal v selectSeats.js",
          err.message
        )
      );
    await canvas
      .screenshot({ path: "./public/screenshots/2_canvas.png" })
      .catch((err) =>
        console.error(
          "❌ Screenshot 2_canvas.png selhal v selectSeats.js",
          err.message
        )
      );
  }

  if (process.env.CONSOLE_LOG === "true") {
    console.log("Načetla se mapa, musel jsem čekat 2 sekundy");
  }

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
  await sleep(2000);
  await getMAll(page);
  await getM(page);
  await getSAll(page);
  await getGPerformance(page);
  await mergeData();
  await mergeSectorData();
  await appendPricesFromPriceCategories();
  //await sleep(2000);
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
