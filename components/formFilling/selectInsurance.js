export async function selectInsurance(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr pojištění");
  }
  const maxTime = 2000;
  const interval = 10;
  const start = performance.now();

  let clicked = false;

  try {
    // Wait for the page to be ready
    await page
      .waitForSelector("#optionsRadiosPoistenie2", { timeout: maxTime })
      .catch((err) =>
        console.error(
          "❌ Element 'optionsRadiosPoistenie2' v selectInsurance.js nebyl nalezen",
          err.message
        )
      );

    while (!clicked && performance.now() - start < maxTime) {
      try {
        clicked = await page.evaluate(() => {
          const el = document.querySelector("#optionsRadiosPoistenie2");
          if (el) {
            el.click();
            return true;
          }
          return false;
        });
      } catch (e) {
        // If we get a navigation error, wait a bit and continue
        await new Promise((resolve) => setTimeout(resolve, interval));
        continue;
      }

      if (clicked) {
        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ Výběr pojištění");
        }
        if (process.env.CONSOLE_LOGS === "true") {
          console.log("✅ Pojištění 'ne' bylo zvoleno.");
        }
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    // Only show warning if we never clicked the button
    if (!clicked) {
      console.warn("❌ Pojištění 'ne' se neobjevilo včas.");
    }
  } catch (error) {
    console.warn("❌ Chyba při výběru pojištění:", error.message);
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Výběr pojištění");
  }
}
