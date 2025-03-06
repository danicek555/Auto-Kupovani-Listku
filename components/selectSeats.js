import { detectFreeSeats } from "./seatDetection.js";
import { clickOnCluster } from "./clickCluster.js";
import { sleep } from "../utils/sleep.js";

export async function selectSeats(page) {
  console.log("Čekám na načtení canvasu...");
  await page.waitForSelector("#canvas", { visible: true });

  const canvas = await page.$("#canvas");
  await sleep(100); // místo sleep()

  await page.screenshot({
    path: "./screenshots/3_site_with_seats.png",
    fullPage: true,
  });
  await canvas.screenshot({ path: "./screenshots/4_canvas.png" });

  console.log("Načetla se mapa a udělal se screenshot");

  const { image, clusters } = await detectFreeSeats(
    "./screenshots/4_canvas.png"
  );

  if (clusters.length === 0) {
    console.log("Žádná volná místa nenalezena!");
    return;
  }

  // Kliknutí na první 4 volná místa
  for (let i = 0; i < Math.min(4, clusters.length); i++) {
    await clickOnCluster(page, canvas, clusters[i], image);
  }

  await image.write("./screenshots/5_blue_free_spots.png");
  console.log("Debug obrázek uložen jako ./screenshots/5_blue_free_spots.png");

  await page.waitForSelector("#hladisko-basket-btn", { visible: true });
  await page.click("#hladisko-basket-btn");
  console.log("Kliknuto na tlačítko 'Pokračovat do košíku'.");
}
