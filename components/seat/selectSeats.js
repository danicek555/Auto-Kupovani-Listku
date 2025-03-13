import { detectFreeSeats } from "./seatDetection.js";
import { clickOnCluster } from "./clickCluster.js";
import { sleep } from "../utils/sleep.js";
import { detectSections, clickOnSection } from "../section/sectionDetection.js";

export async function selectSeats(page) {
  console.log("Čekám na načtení canvasu...");
  await page.waitForSelector("#canvas", { visible: true, timeout: 5000 });
  await page.waitForFunction(() => {
    const canvas = document.querySelector("#canvas");
    return canvas && canvas.width > 0 && canvas.height > 0;
  });

  const canvas = await page.$("#canvas");
  if (!canvas) throw new Error("Canvas nelze najít!");

  let attempts = 0;
  const maxAttempts = 3;
  let lastScreenshotPath = "./public/screenshots/4_canvas.png";

  while (attempts < maxAttempts) {
    try {
      // Take initial screenshot
      await page.screenshot({
        path: "./public/screenshots/3_site_with_seats.png",
        fullPage: true,
      });
      await canvas.screenshot({ path: lastScreenshotPath });

      // Try to detect sections
      const { image: sectionImage, sections } = await detectSections(
        lastScreenshotPath
      );

      if (sections.length > 0) {
        console.log(`Nalezeno ${sections.length} sekcí.`);
        // Save the visualization of detected sections
        await sectionImage.write(
          `./public/screenshots/4_1_detected_sections_attempt_${
            attempts + 1
          }.png`
        );

        // Click on the first available section
        await clickOnSection(page, canvas, sections[0]);
        await sleep(1000);

        // Update screenshot path and take new screenshot
        lastScreenshotPath = `./public/screenshots/4_2_section_view_attempt_${
          attempts + 1
        }.png`;
        await canvas.screenshot({ path: lastScreenshotPath });

        // Check if we're now seeing seats
        const checkImage = await detectSections(lastScreenshotPath);
        if (checkImage.sections.length === 0) {
          console.log("Úspěšně jsme se dostali na pohled sedadel!");
          break;
        }

        attempts++;
        await sleep(500);
        continue;
      } else {
        console.log("Žádné sekce nenalezeny, pokračuji na detekci sedadel...");
        break;
      }
    } catch (error) {
      attempts++;
      await sleep(1000);
      if (attempts >= maxAttempts) {
        throw new Error("Překročen maximální počet pokusů!");
      }
    }
  }

  // Take fresh screenshot before seat detection
  await canvas.screenshot({ path: lastScreenshotPath });

  // Proceed with seat detection
  console.log(`Detekuji sedadla z: ${lastScreenshotPath}`);
  const { image, clusters } = await detectFreeSeats(lastScreenshotPath);

  if (clusters.length === 0) {
    console.log("Žádná volná místa nenalezena!");
    return;
  }

  // Save visualization of detected seats
  await image.write("./public/screenshots/5_blue_free_spots.png");
  console.log(
    "Debug obrázek uložen jako ./public/screenshots/5_blue_free_spots.png"
  );

  // Click seats quickly
  for (let i = 0; i < Math.min(4, clusters.length); i++) {
    await clickOnCluster(page, canvas, clusters[i], image);
    await sleep(500);
  }

  await page.waitForSelector("#hladisko-basket-btn", {
    visible: true,
    timeout: 5000,
  });
  await page.click("#hladisko-basket-btn");
}
